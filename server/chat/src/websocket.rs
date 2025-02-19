use crate::AppState;
use axum::{
    extract::{
        ws::{self, WebSocket},
        Path, State, WebSocketUpgrade,
    },
    response::IntoResponse,
};
use chrono::Utc;
use futures::{stream::SplitSink, SinkExt as _, StreamExt as _};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

#[derive(Deserialize)]
enum EventFromClient {
    Message(MessageFromClient),
    AddReaction,
}

#[derive(Serialize, Deserialize)]
struct MessageFromClient {
    author: models::User,
    content: String,
    reply_to_id: Option<String>,
}

#[derive(Serialize)]
enum EventFromServer {
    Message(MessageFromServer),
    JoinedRoom(models::Room),
    AddReaction,
}

#[derive(Serialize, Deserialize)]
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

async fn websocket(stream: WebSocket, state: Arc<AppState>, room_id: String) {
    let (mut sender, mut receiver) = stream.split();

    let room = state.join(&room_id).await.unwrap();

    EventFromServer::JoinedRoom(room)
        .send(&mut sender)
        .await
        .unwrap();

    let state_cloned = state.clone();
    let room_id_clone = room_id.clone();

    let mut recv_task = tokio::spawn(async move {
        let room_tx = state_cloned.room_tx.lock().await;
        let tx = room_tx.get(&room_id_clone).unwrap();
        while let Some(Ok(ws::Message::Text(text))) = receiver.next().await {
            let event = serde_json::from_str(&text).unwrap();

            match event {
                EventFromClient::Message(msg) => {
                    let mut db = state_cloned.db.lock().await;
                    db.add_message(models::Message {
                        id: "".to_owned(),
                        room_id: room_id_clone.clone(),
                        user_id: Some(msg.author.id.clone()),
                        content: msg.content.clone(),
                        reply_to_id: msg.reply_to_id.clone(),
                        created_at: Utc::now(),
                    })
                    .await
                    .unwrap();

                    let msg = serde_json::to_string(&msg).unwrap();
                    let _ = tx.send(msg.into());
                }

                EventFromClient::AddReaction => {}
            }
        }
    });

    let room_id_clone = room_id.clone();
    let room_tx = state.room_tx.lock().await;
    let tx = room_tx.get(&room_id_clone).unwrap();
    let mut rx = tx.subscribe();

    let mut send_task = tokio::spawn(async move {
        while let Ok(msg) = rx.recv().await {
            let _ = sender.send(ws::Message::Text(msg)).await;
        }
    });

    tokio::select! {
        _ = &mut send_task => recv_task.abort(),
        _ = &mut recv_task => send_task.abort(),
    };
}
