use crate::{clerk::VerifiedToken, error::CoreError, AppState};
use axum::{
    extract::{
        ws::{self, WebSocket},
        Path, State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use chrono::Utc;
use futures::{
    stream::{SplitSink, SplitStream},
    StreamExt as _,
};
use models::websocket::{EventFromClient, EventFromServer, WSRoom, WSUserMessageFromServer};
use serde::Serialize;
use std::sync::Arc;
use uuid::Uuid;

#[derive(Clone, Debug, Serialize)]
pub enum InternalEvent {
    Response {
        target_id: String,
        event: EventFromServer,
    },
    Broadcast {
        event: EventFromServer,
    },
}

impl InternalEvent {
    async fn handle(
        self,
        user_id: &str,
        sender: &mut SplitSink<WebSocket, ws::Message>,
    ) -> Result<(), serde_json::Error> {
        match self {
            InternalEvent::Response { target_id, event } => {
                if target_id == user_id {
                    let _ = event.send(sender).await;
                }
            }
            InternalEvent::Broadcast { event } => {
                let _ = event.send(sender).await;
            }
        };
        Ok(())
    }
}

pub async fn websocket_handler(
    ws: WebSocketUpgrade,
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
) -> impl IntoResponse {
    ws.on_upgrade(|socket| websocket(socket, state, room_id))
}

pub async fn check_auth(receiver: &mut SplitStream<WebSocket>) -> Result<String, CoreError> {
    match receiver.next().await {
        Some(Ok(ws::Message::Text(text))) => match serde_json::from_str::<EventFromClient>(&text) {
            Ok(EventFromClient::JoinRoom { token }) => {
                let user_id = VerifiedToken::new(&token).user_id()?;
                Ok(user_id)
            }
            _ => Err(CoreError::AuthError("Invalid token")),
        },
        _ => Err(CoreError::AuthError("Invalid token")),
    }
}

pub async fn sync_message(
    state: Arc<AppState>,
    user_id: &str,
    room_id: &str,
    limit: u32,
) -> Result<(), ()> {
    let room_tx = state.room_tx.lock().await;
    let tx = match room_tx.get(room_id) {
        Some(v) => v,
        None => {
            tracing::info!("Room not found");
            return Err(());
        }
    };

    let (messages, users) = {
        let db = state.db.lock().await;
        let messages = db
            .get_latest_messages(room_id, limit)
            .await
            .map_err(|_| ())?;

        let users = db.get_room_participants(room_id).await.map_err(|_| ())?;
        (messages, users)
    };

    let messages = messages
        .iter()
        .map(|m| {
            let (author_name, author_image_url) = users
                .iter()
                .find(|u| Some(&u.id) == m.0.user_id.as_ref())
                .map(|u| (u.nickname.clone(), u.image_url.clone()))
                .unwrap_or((None, None));

            WSUserMessageFromServer {
                id: m.0.id.clone(),
                author_id: m.0.user_id.clone(),
                author_name,
                author_image_url: author_image_url.clone(),
                content: m.0.content.clone(),
                reply_to_id: m.0.reply_to_id.clone(),
            }
        })
        .collect::<Vec<WSUserMessageFromServer>>();

    let _ = tx.send(InternalEvent::Response {
        target_id: user_id.to_owned(),
        event: EventFromServer::SyncMessage { messages },
    });

    Ok(())
}

async fn websocket(stream: WebSocket, state: Arc<AppState>, room_id: String) {
    let (mut sender, mut receiver) = stream.split();

    let user_id = match check_auth(&mut receiver).await {
        Ok(v) => v,
        Err(_) => {
            tracing::info!("Unauthorized connection");

            let _ = EventFromServer::FailedToJoinRoom {
                message: "Unauthorized error".to_owned(),
            }
            .send(&mut sender)
            .await;
            return;
        }
    };

    tracing::info!("{user_id} connected");

    let room = match state.join(&room_id).await {
        Ok(v) => v,
        Err(_) => {
            let _ = EventFromServer::FailedToJoinRoom {
                message: "Room not found".to_owned(),
            }
            .send(&mut sender)
            .await;
            return;
        }
    };

    let _ = EventFromServer::JoinedRoom(WSRoom {
        id: room.id.clone(),
        name: room.room_name.clone(),
    })
    .send(&mut sender)
    .await;

    let state_cloned = state.clone();

    let user_id_cloned = user_id.clone();
    let mut recv_task = tokio::spawn(async move {
        while let Some(Ok(ws::Message::Text(text))) = receiver.next().await {
            let event = match serde_json::from_str(&text) {
                Ok(v) => v,
                Err(e) => {
                    tracing::info!("{e}");
                    // TODO: Send error to the client
                    continue;
                }
            };

            event_from_client_handle(event, state_cloned.clone(), &user_id_cloned, &room).await;
        }
    });

    let mut rx = {
        let room_tx = state.room_tx.lock().await;

        let tx = match room_tx.get(&room_id) {
            Some(v) => v,
            None => {
                tracing::info!("Room not found");
                return;
            }
        };

        tx.subscribe()
    };

    let user_id_cloned = user_id.clone();
    let mut send_task = tokio::spawn(async move {
        while let Ok(internal_event) = rx.recv().await {
            let _ = internal_event.handle(&user_id_cloned, &mut sender).await;
        }
    });

    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    };

    tracing::info!("{user_id} disconnected");
}

async fn event_from_client_handle(
    event: EventFromClient,
    state: Arc<AppState>,
    user_id: &str,
    room: &models::Room,
) {
    // WARN: Do not log JoinedRoom events. It includes user's token;

    match event {
        EventFromClient::RequestSyncMessage { limit } => {
            let _ = sync_message(state.clone(), user_id, &room.id, limit).await;
        }

        EventFromClient::UserMessage(msg) => {
            tracing::info!("Message: {msg:?}");

            let mut db = state.db.lock().await;
            let message_id = Uuid::new_v4().to_string();

            db.add_message(models::Message {
                id: message_id.clone(),
                room_id: room.id.clone(),
                user_id: Some(msg.author_id.clone()),
                content: msg.content.clone(),
                reply_to_id: msg.reply_to_id.clone(),
                created_at: Utc::now(),
            })
            .await
            .unwrap_or_else(|e| {
                tracing::error!("Failed to add message: {e:?}");
            });

            let event_from_server = EventFromServer::Message(WSUserMessageFromServer {
                id: message_id,
                author_id: Some(msg.author_id),
                author_name: Some(msg.author_name),
                author_image_url: msg.author_image_url,
                content: msg.content,
                reply_to_id: msg.reply_to_id,
            });

            let room_tx = state.room_tx.lock().await;
            let tx = match room_tx.get(&room.id) {
                Some(v) => v,
                None => {
                    tracing::info!("Room not found");
                    return;
                }
            };

            let _ = tx.send(InternalEvent::Broadcast {
                event: event_from_server,
            });
        }

        EventFromClient::AddReaction => {}

        _ => {}
    }
}
