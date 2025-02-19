use crate::{clerk, AppState};
use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    response::Json,
};
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
        (status = 404, description = "Not found")
    ),
    tag = "User"
)]
pub async fn get_user_me(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<models::User>, StatusCode> {
    let db = state.db.lock().await;
    let user_id = clerk::get_user_id(headers)?;

    let user = db
        .get_user(&user_id)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    Ok(Json(user))
}

#[axum::debug_handler]
#[utoipa::path(
    get,
    path = "/users/{id}",
    summary = "Get user by id",
    description = "IDからユーザーを取得",
    responses(
        (status = 200, description = "Found user", body = models::User),
        (status = 404, description = "User not found")
    ),
    tag = "User"
)]
pub async fn get_user(
    Path(user_id): Path<String>,
    State(state): State<Arc<AppState>>,
) -> Result<Json<models::User>, StatusCode> {
    let db = state.db.lock().await;

    let user = db
        .get_user(&user_id)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    Ok(Json(user))
}
