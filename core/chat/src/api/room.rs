use crate::{clerk::VerifiedToken, AppState};
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::Json,
};
use chrono::Utc;
use db::error::IntoStatusCode;
use models::{CreateRoomRequest, Participant, RoomUpdate};
use std::sync::Arc;
use uuid::Uuid;

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    post,
    path = "/rooms",
    summary = "Create room",
    description = "ルームを新規作成",
    request_body = CreateRoomRequest,
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
    Json(request): Json<CreateRoomRequest>,
) -> Result<(StatusCode, HeaderMap, Json<models::Room>), StatusCode> {
    let user_id = VerifiedToken::from_headers(&headers)?.user_id()?;
    let room_id = Uuid::new_v4().to_string();

    let new_room = models::Room {
        id: room_id.clone(),
        room_name: request.room_name,
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
    params(
        ("room_id" = String, Path)
    ),
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
    let user_id = VerifiedToken::from_headers(&headers)?.user_id()?;

    let mut db = state.db.lock().await;
    let room = db.get_room(&room_id).await.into_statuscode()?;

    if room.creator_id == Some(user_id) {
        db.delete_room(&room_id).await.into_statuscode()?;
        tracing::info!("Room deleted with ID: {}", room_id);
        Ok(StatusCode::NO_CONTENT)
    } else {
        Err(StatusCode::FORBIDDEN)
    }
}

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    get,
    path = "/rooms/{room_id}",
    summary = "Get room information",
    description = "ルームの情報を取得",
    params(
        ("room_id" = String, Path)
    ),
    responses(
        (status = 200, description = "Success to get room", body = models::Room),
        (status = 404, description = "Room not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "Room"
)]
pub async fn get_room(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    Path(room_id): Path<String>,
) -> Result<Json<models::Room>, StatusCode> {
    VerifiedToken::from_headers(&headers)?.verify()?;

    let room = state
        .db
        .lock()
        .await
        .get_room(&room_id)
        .await
        .into_statuscode()?;

    Ok(Json(room))
}

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    patch,
    path = "/rooms/{room_id}",
    summary = "Update room",
    description = "ルームをアップデート",
    params(
        ("room_id" = String, Path)
    ),
    request_body (content = RoomUpdate),
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
        name: room_update.name,
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
    get,
    path = "/rooms/{room_id}/users",
    summary = "Get users in room",
    description = "ルーム内のユーザ一覧を取得",
    params(
        ("room_id" = String, Path)
    ),
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

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    post,
    path = "/rooms/{room_id}/users",
    summary = "Add users to room",
    description = "ルームにユーザーを追加",
    params(
        ("room_id" = String, Path)
    ),
    responses(
        (status = 200, description = "Success to add user"),
        (status = 404, description = "Room not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "Room"
)]
pub async fn add_user_to_room(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    headers: HeaderMap,
) -> Result<StatusCode, StatusCode> {
    let user_id = VerifiedToken::from_headers(&headers)?.user_id()?;

    state
        .db
        .lock()
        .await
        .add_participant(Participant {
            room_id,
            user_id,
            joined_at: Utc::now(),
        })
        .await
        .into_statuscode()?;

    Ok(StatusCode::NO_CONTENT)
}

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    delete,
    path = "/rooms/{room_id}/users",
    summary = "Delete users from room",
    description = "ルームからユーザーを退出",
    params(
        ("room_id" = String, Path)
    ),
    responses(
        (status = 200, description = "Success to delete user"),
        (status = 404, description = "Room not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "Room"
)]
pub async fn delete_user_from_room(
    State(state): State<Arc<AppState>>,
    Path(room_id): Path<String>,
    headers: HeaderMap,
) -> Result<StatusCode, StatusCode> {
    let user_id = VerifiedToken::from_headers(&headers)?.user_id()?;

    state
        .db
        .lock()
        .await
        .delete_participant(&room_id, &user_id)
        .await
        .into_statuscode()?;

    Ok(StatusCode::NO_CONTENT)
}
