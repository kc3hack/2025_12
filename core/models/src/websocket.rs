use axum::extract::ws::{self, WebSocket};
use futures::{stream::SplitSink, SinkExt as _};
use serde::{Deserialize, Serialize};
use ts_rs::TS;

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct WSUserMessageFromServer {
    pub id: String,
    pub author_name: String,
    pub author_avatar_url: String,
    pub content: String,
    pub reply_to_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct WSUserMessageFromClient {
    pub author_name: String,
    pub author_avatar_url: String,
    pub content: String,
    pub reply_to_id: Option<String>,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[ts(export)]
pub struct WSRoom {
    pub id: String,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, TS)]
#[serde(tag = "type", rename_all = "PascalCase")]
#[ts(export)]
pub enum EventFromClient {
    RequestSyncMessage { limit: u32 },
    UserMessage(WSUserMessageFromClient),
    JoinRoom { token: String },
    AddReaction,
}

#[derive(Clone, Debug, Serialize, Deserialize, TS)]
#[serde(tag = "type", rename_all = "PascalCase")]
#[ts(export)]
pub enum EventFromServer {
    SyncMessage {
        messages: Vec<WSUserMessageFromServer>,
    },
    Message(WSUserMessageFromServer),
    JoinedRoom(WSRoom),
    FailedToJoinRoom {
        message: String,
    },
    AddReaction,
}

impl EventFromServer {
    pub async fn send(
        self,
        sender: &mut SplitSink<WebSocket, ws::Message>,
    ) -> Result<(), serde_json::Error> {
        let event = serde_json::to_string(&self)?;
        let _ = sender.send(ws::Message::text(event)).await;
        Ok(())
    }
}
