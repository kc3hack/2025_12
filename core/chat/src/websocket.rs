mod event;
mod translate;

use crate::{clerk::VerifiedToken, error::CoreError, AppState};
use axum::{
    extract::{
        ws::{self, WebSocket},
        Path, State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use event::event_from_client_handle;
use futures::{
    stream::{SplitSink, SplitStream},
    StreamExt as _,
};
use models::websocket::{EventFromClient, EventFromServer, FailedToJoinRoomReason, WSRoom};
use serde::Serialize;
use std::sync::Arc;

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

async fn websocket(stream: WebSocket, state: Arc<AppState>, room_id: String) {
    let (mut sender, mut receiver) = stream.split();

    let user_id = match check_auth(&mut receiver).await {
        Ok(v) => v,
        Err(_) => {
            tracing::info!("Unauthorized connection");

            let _ = EventFromServer::FailedToJoinRoom {
                reason: FailedToJoinRoomReason::Unauthorized,
            }
            .send(&mut sender)
            .await;
            return;
        }
    };

    tracing::info!("{user_id} connected");

    let room = match state.join(&room_id).await {
        Ok(v) => {
            let db = state.db.lock().await;
            let users = match db.get_room_participants(&room_id).await {
                Ok(v) => v,
                Err(_) => {
                    let _ = EventFromServer::FailedToJoinRoom {
                        reason: FailedToJoinRoomReason::RoomNotFound,
                    }
                    .send(&mut sender)
                    .await;
                    tracing::info!("{user_id} disconnected");
                    return;
                }
            };

            if users.iter().any(|u| u.id == user_id) {
                v
            } else {
                let _ = EventFromServer::FailedToJoinRoom {
                    reason: FailedToJoinRoomReason::NotParticipated {
                        room_id: room_id.clone(),
                    },
                }
                .send(&mut sender)
                .await;
                tracing::info!("{user_id} disconnected");
                return;
            }
        }
        Err(_) => {
            let _ = EventFromServer::FailedToJoinRoom {
                reason: FailedToJoinRoomReason::RoomNotFound,
            }
            .send(&mut sender)
            .await;
            tracing::info!("{user_id} disconnected");
            return;
        }
    };

    let tx = {
        let room_tx = state.room_tx.lock().await;
        match room_tx.get(&room.id) {
            Some(v) => v.clone(),
            None => {
                return;
            }
        }
    };

    let (author_name, author_image_url) = {
        let db = state.db.lock().await;
        let users = db.get_room_participants(&room.id).await.unwrap();
        let author = users.iter().find(|u| u.id == user_id);

        let author_name = author.and_then(|f| f.nickname.clone());
        let author_image_url = author.and_then(|f| f.image_url.clone());

        (author_name, author_image_url)
    };

    let _ = EventFromServer::JoinedRoom(WSRoom {
        id: room.id.clone(),
        name: room.room_name.clone(),
    })
    .send(&mut sender)
    .await;

    let state_cloned = state.clone();
    let user_id_cloned = user_id.clone();
    let tx_cloned = tx.clone();
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

            if let Err(e) = event_from_client_handle(
                event,
                tx_cloned.clone(),
                state_cloned.clone(),
                &room,
                &user_id_cloned,
                &author_name,
                &author_image_url,
            )
            .await
            {
                tracing::info!("{e}");
            }
        }
    });

    let mut rx = tx.subscribe();
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
