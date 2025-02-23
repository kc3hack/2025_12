use super::translate::translate;
use crate::{websocket::InternalEvent, AppState};
use chrono::Utc;
use color_eyre::eyre::OptionExt as _;
use models::websocket::{EventFromClient, EventFromServer, WSUserMessageFromServer};
use std::sync::Arc;
use tokio::sync::broadcast::Sender;
use uuid::Uuid;

pub async fn event_from_client_handle(
    event: EventFromClient,
    tx: Sender<InternalEvent>,
    state: Arc<AppState>,
    room: &models::Room,
    author_id: &str,
    author_name: &Option<String>,
    author_image_url: &Option<String>,
) -> color_eyre::Result<()> {
    // WARN: Do not log JoinedRoom events. It includes user's token;

    match event {
        EventFromClient::RequestSyncMessage { limit } => {
            sync_message(state.clone(), author_id, &room.id, limit).await?;
        }

        EventFromClient::UserMessage(msg) => {
            tracing::info!("Message: {msg:?}");

            let message_id = Uuid::new_v4().to_string();

            {
                let mut db = state.db.lock().await;

                db.add_message(models::Message {
                    id: message_id.clone(),
                    room_id: room.id.clone(),
                    user_id: Some(author_id.to_owned()),
                    content: msg.content.clone(),
                    reply_to_id: msg.reply_to_id.clone(),
                    created_at: Utc::now(),
                })
                .await?
            }

            let event_from_server = EventFromServer::Message(WSUserMessageFromServer {
                id: message_id,
                author_id: Some(author_id.to_owned()),
                author_name: author_name.clone(),
                author_image_url: author_image_url.clone(),
                content: msg.content,
                reply_to_id: msg.reply_to_id,
            });

            tx.send(InternalEvent::Broadcast {
                event: event_from_server,
            })?;
        }

        EventFromClient::RequestTranslateMessage { message } => {
            let tralslated_text = translate(&message).await?;
            tx.send(InternalEvent::Response {
                target_id: author_id.to_owned(),
                event: EventFromServer::TranslatedMessage {
                    message: tralslated_text,
                },
            })?;
        }
        EventFromClient::AddReaction => {}

        _ => {}
    }

    Ok(())
}

pub async fn sync_message(
    state: Arc<AppState>,
    user_id: &str,
    room_id: &str,
    limit: u32,
) -> color_eyre::Result<()> {
    let room_tx = state.room_tx.lock().await;
    let tx = room_tx.get(room_id).ok_or_eyre("Room not found")?;

    let (messages, users) = {
        let db = state.db.lock().await;
        let messages = db.get_latest_messages(room_id, limit).await?;

        let users = db.get_room_participants(room_id).await?;
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
