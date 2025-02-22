use crate::{clerk::VerifiedToken, AppState};
use axum::{
    extract::{Path, Query, State},
    http::{HeaderMap, StatusCode},
    Json,
};
use chrono::{DateTime, Utc};
use db::error::IntoStatusCode as _;
use std::{collections::HashMap, sync::Arc};

#[utoipa::path(
    get,
    path = "/rooms/{room_id}/messages",
    params(
        ("room_id" = String, Path),
        ("limit" = u32, Query),
        ("last_created_at" = Option<DateTime<Utc>>, Query, description = "Optional timestamp to get messages before this time")
    ),
    summary = "Get messages in room",
    description = "ルーム内のメッセージ一覧を取得。指定された時刻以前のメッセージを取得することも可能。",
    responses(
        (status = 200, description = "Success to get messages", body = Vec<models::Message>),
        (status = 404, description = "Room not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "Messages"
)]
pub async fn get_room_messages(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    Query(params): Query<HashMap<String, String>>,
    headers: HeaderMap,
) -> Result<Json<Vec<models::Message>>, StatusCode> {
    VerifiedToken::from_headers(&headers)?.verify()?;

    static DEFAULT_LIMIT: u32 = 20;

    let last_created_at = params
        .get("last_created_at")
        .and_then(|v| serde_json::from_str::<DateTime<Utc>>(v).ok());

    let limit = params
        .get("limit")
        .and_then(|v| serde_json::from_str::<u32>(v).ok())
        .unwrap_or(DEFAULT_LIMIT);

    let messages_with_reply = if let Some(last_created_at) = last_created_at {
        state
            .db
            .lock()
            .await
            .get_older_messages(&room_id, limit, last_created_at)
            .await
            .into_statuscode()?
    } else {
        state
            .db
            .lock()
            .await
            .get_latest_messages(&room_id, limit)
            .await
            .into_statuscode()?
    };

    let messages = messages_with_reply.into_iter().map(|m| m.0).collect();

    Ok(Json(messages))
}
