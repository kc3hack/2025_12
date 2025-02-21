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
    path = "/users/{id}",
    summary = "Get user by id",
    description = "IDからユーザーを取得",
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
