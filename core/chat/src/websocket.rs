use crate::{
    clerk::{get_authenticated_user_id, get_payload_from_token},
    AppState,
};
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
    SinkExt as _, StreamExt as _,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(tag = "type", rename_all = "PascalCase")]
enum EventFromClient {
    Message(MessageFromClient),
    JoinRoom { token: String },
    AddReaction,
}

#[derive(Debug, Serialize, Deserialize)]
struct MessageFromClient {
    author_name: String,
    content: String,
    reply_to_id: Option<String>,
}

#[derive(Clone, Serialize)]
pub enum EventFromServer {
    Message(MessageFromServer),
    JoinedRoom(models::Room),
    FailedToJoinRoom { message: String },
    AddReaction,
}

#[derive(Clone, Serialize, Deserialize)]
struct MessageFromServer {
    author_name: String,
    author_avatar_url: String,
    content: String,
}

impl EventFromServer {
    async fn send(
        self,
        sender: &mut SplitSink<WebSocket, ws::Message>,
    ) -> Result<(), serde_json::Error> {
        let event = serde_json::to_string(&self)?;
        let _ = sender.send(ws::Message::text(event)).await;
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

pub async fn check_auth(receiver: &mut SplitStream<WebSocket>) -> Result<String, ()> {
    match receiver.next().await {
        Some(Ok(ws::Message::Text(text))) => match serde_json::from_str::<EventFromClient>(&text) {
            Ok(EventFromClient::JoinRoom { token }) => {
                let payload = get_payload_from_token(&token)?;
                let user_id = get_authenticated_user_id(payload)?;
                Ok(user_id)
            }
            _ => Err(()),
        },
        _ => Err(()),
    }
}

// TODO: Handling errors without unwrap
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

    EventFromServer::JoinedRoom(room)
        .send(&mut sender)
        .await
        .unwrap();

    let state_cloned = state.clone();
    let room_id_clone = room_id.clone();

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

            // WARN: Do not log FailedToJoinRoom events. It includes user's token;

            match event {
                EventFromClient::Message(msg) => {
                    let mut db = state_cloned.db.lock().await;
                    let message_id = Uuid::new_v4().to_string();
                    db.add_message(models::Message {
                        id: message_id,
                        room_id: room_id_clone.clone(),
                        user_id: Some(user_id_cloned.clone()),
                        content: msg.content.clone(),
                        reply_to_id: msg.reply_to_id.clone(),
                        created_at: Utc::now(),
                    })
                    .await
                    .unwrap();

                    let event_from_server = EventFromServer::Message(MessageFromServer {
                        author_name: msg.author_name.clone(),
                        author_avatar_url: "".to_owned(), // TODO: Set avatar url
                        content: msg.content.clone(),
                    });

                    let room_tx = state_cloned.room_tx.lock().await;
                    let tx = room_tx.get(&room_id_clone).unwrap();
                    let _ = tx.send(event_from_server);

                    tracing::info!("Message: {msg:?}");
                }

                EventFromClient::AddReaction => {}
                _ => {}
            }
        }
    });

    let room_id_clone = room_id.clone();
    let mut rx = {
        let room_tx = state.room_tx.lock().await;
        let tx = room_tx.get(&room_id_clone).unwrap();
        tx.subscribe()
    };

    let mut send_task = tokio::spawn(async move {
        while let Ok(event_from_server) = rx.recv().await {
            let _ = event_from_server.send(&mut sender).await;
        }
    });

    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    };

    tracing::info!("{user_id} disconnected")
}
