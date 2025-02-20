use crate::{clerk, AppState};
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
    let db = state.db.lock().await;
    let user_id = clerk::get_authenticated_user_id(headers)?;
    let user = db.get_user(&user_id).await.into_statuscode()?;

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
    let _ = clerk::get_authenticated_user_id(headers)?;
    let db = state.db.lock().await;
    let user = db.get_user(&user_id).await.into_statuscode()?;

    Ok(Json(user))
}
