use crate::{clerk, AppState};
use axum::{
    extract::{Query, State},
    http::{HeaderMap, StatusCode},
    response::Json,
};
use chrono::Utc;
use models::Room;
use std::sync::Arc;

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    get,
    path = "/rooms/create",
    summary = "Create room",
    description = "ルームを新規作成",
    responses(
        (status = 200, description = "Found user", body = models::Room),
        (status = 404, description = "Not found")
    ),
    tag = "Room"
)]
pub async fn create_room(
    State(state): State<Arc<AppState>>,
    Query(id): Query<String>,
    headers: HeaderMap,
) -> Result<Room, StatusCode> {
    let mut db = state.db.lock().await;
    let user_id = clerk::get_user_id(headers)?;

    let new_room = models::Room {
        id,
        creator_id: Some(user_id),
        url: "".to_owned(),
        expired_at: None,
        created_at: Utc::now(),
    };

    db.add_room(new_room);

    let user = db.get_user(&user_id).await.map_err(|e| {
        tracing::error!("{e}");
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(new_room))
}
