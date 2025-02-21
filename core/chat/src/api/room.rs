use crate::{clerk::VerifiedToken, AppState};
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::Json,
};
use chrono::Utc;
use db::error::IntoStatusCode;
use models::{Participant, RoomUpdate};
use std::sync::Arc;
use uuid::Uuid;

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    post,
    path = "/rooms",
    summary = "Create room",
    description = "ルームを新規作成",
    responses(
        (status = 200, description = "Success to create room", body = models::Room),
        (status = 404, description = "Room not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "Room"
)]
pub async fn create_room(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<(StatusCode, HeaderMap, Json<models::Room>), StatusCode> {
    let user_id = VerifiedToken::from_headers(&headers)?.user_id()?;
    let room_id = Uuid::new_v4().to_string();

    let new_room = models::Room {
        id: room_id.clone(),
        creator_id: Some(user_id.clone()),
        url: format!("/{room_id}"),
        expired_at: None,
        created_at: Utc::now(),
    };

    {
        let mut db = state.db.lock().await;
        db.add_room(new_room.clone()).await.into_statuscode()?;

        db.add_participant(Participant {
            room_id: room_id.clone(),
            user_id,
            joined_at: Utc::now(),
        })
        .await
        .into_statuscode()?;
    }

    let mut response_headers = HeaderMap::new();
    response_headers.insert("Location", format!("/rooms/{}", room_id).parse().unwrap());

    tracing::info!("Room created with ID: {}", room_id);

    Ok((StatusCode::CREATED, response_headers, Json(new_room)))
}

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    delete,
    path = "/rooms/{room_id}",
    summary = "Delete room",
    description = "ルームを削除",
    responses(
        (status = 204, description = "Success to remove room"),
        (status = 404, description = "Room not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "Room"
)]
pub async fn delete_room(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    headers: HeaderMap,
) -> Result<StatusCode, StatusCode> {
    VerifiedToken::from_headers(&headers)?.verify()?;

    state
        .db
        .lock()
        .await
        .remove_room(&room_id)
        .await
        .into_statuscode()?;

    tracing::info!("Room deleted with ID: {}", room_id);

    Ok(StatusCode::NO_CONTENT)
}

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    patch,
    path = "/rooms/{room_id}",
    summary = "Update room",
    description = "ルームをアップデート",
    request_body (content = RoomUpdate ),
    responses(
        (status = 200, description = "Success to update room", body = models::Room),
        (status = 404, description = "Room not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "Room"
)]
pub async fn update_room(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    headers: HeaderMap,
    Json(room_update): Json<RoomUpdate>,
) -> Result<Json<models::Room>, StatusCode> {
    VerifiedToken::from_headers(&headers)?.verify()?;

    let room_update = RoomUpdate {
        creator_id: room_update.creator_id.clone(),
        expired_at: room_update.expired_at,
    };

    let updated_room = state
        .db
        .lock()
        .await
        .update_room(&room_id, room_update)
        .await
        .into_statuscode()?;

    tracing::info!("Room updated with ID: {}", room_id);

    Ok(Json(updated_room))
}

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    post,
    path = "/rooms/{room_id}/users",
    summary = "Get users in room",
    description = "ルーム内のユーザ一覧を取得",
    responses(
        (status = 200, description = "Success to get users", body = Vec<models::User>),
        (status = 404, description = "Room not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "Room"
)]
pub async fn get_room_users(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    headers: HeaderMap,
) -> Result<Json<Vec<models::User>>, StatusCode> {
    VerifiedToken::from_headers(&headers)?.verify()?;

    let users = state
        .db
        .lock()
        .await
        .get_room_participants(&room_id)
        .await
        .into_statuscode()?;

    Ok(Json(users))
}
