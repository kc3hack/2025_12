use crate::{clerk::VerifiedToken, AppState};
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::Json,
};
use db::error::IntoStatusCode;
use std::sync::Arc;

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    get,
    path = "/users/me",
    summary = "Get user me",
    description = "ログインユーザーの情報を取得",
    responses(
        (status = 200, description = "Found user", body = models::User),
        (status = 404, description = "User not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "User"
)]
pub async fn get_user_me(
    headers: HeaderMap,
    State(state): State<Arc<AppState>>,
) -> Result<Json<models::User>, StatusCode> {
    let user_id = VerifiedToken::from_headers(&headers)?.user_id()?;

    let user = state
        .db
        .lock()
        .await
        .get_user(&user_id)
        .await
        .into_statuscode()?;

    Ok(Json(user))
}

#[axum::debug_handler]
#[tracing::instrument]
#[utoipa::path(
    get,
    path = "/users/{user_id}",
    summary = "Get user by id",
    description = "IDからユーザーを取得",
    params(
        ("user_id" = String, Path)
    ),
    responses(
        (status = 200, description = "Found user", body = models::User),
        (status = 404, description = "User not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "User"
)]
pub async fn get_user(
    headers: HeaderMap,
    Path(user_id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<models::User>, StatusCode> {
    VerifiedToken::from_headers(&headers)?.verify()?;

    let user = state
        .db
        .lock()
        .await
        .get_user(&user_id)
        .await
        .into_statuscode()?;

    Ok(Json(user))
}

#[axum::debug_handler]
#[tracing::instrument(skip(headers))]
#[utoipa::path(
    get,
    path = "/users/rooms",
    summary = "Get rooms user have",
    description = "ユーザーが参加しているルームを取得",
    responses(
        (status = 200, description = "Success to get rooms", body = Vec<models::Room>),
        (status = 404, description = "Room not found"),
        (status = 500, description = "Internal server error"),
        (status = 503, description = "Failed to communicate database"),
    ),
    tag = "User"
)]
pub async fn get_user_rooms(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<Vec<models::Room>>, StatusCode> {
    let user_id = VerifiedToken::from_headers(&headers)?.user_id()?;

    let rooms = state
        .db
        .lock()
        .await
        .get_user_rooms(&user_id)
        .await
        .into_statuscode()?;

    Ok(Json(rooms))
}
