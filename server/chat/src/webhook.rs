use crate::{clerk::verify_webhook, AppState};
use axum::{
    body::Bytes,
    extract::State,
    http::{HeaderMap, StatusCode},
};
use std::sync::Arc;

#[axum::debug_handler]
#[tracing::instrument(skip(headers, body))]
pub async fn webhook_user_signup(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<StatusCode, StatusCode> {
    let mut db = state.db.lock().await;

    tracing::debug!("webhook 'user.created' received");

    let verified_webhook = verify_webhook(body, headers, "SIGNING_SECRET_USER_SIGNUP")?;
    let user = verified_webhook.data::<clerk_rs::models::User>()?;

    user.id.clone().inspect(|id| {
        tracing::debug!("User signed up: id:{id}");
    });

    db.add_user(user)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}

#[axum::debug_handler]
#[tracing::instrument(skip(headers, body))]
pub async fn webhook_user_deleted(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<StatusCode, StatusCode> {
    let mut db = state.db.lock().await;

    tracing::debug!("webhook received");

    let verified_webhook = verify_webhook(body, headers, "SIGNING_SECRET_USER_DELETED")?;
    let user = verified_webhook.data::<clerk_rs::models::User>()?;

    user.id.clone().inspect(|id| {
        tracing::debug!("User deleted: id:{id}");
    });

    if let Some(user_id) = user.id {
        db.remove_user(&user_id)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    }

    Ok(StatusCode::OK)
}

#[axum::debug_handler]
#[tracing::instrument(skip(headers, body))]
pub async fn webhook_user_updated(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<StatusCode, StatusCode> {
    let mut db = state.db.lock().await;

    tracing::debug!("webhook received");

    let verified_webhook = verify_webhook(body, headers, "SIGNING_SECRET_USER_UPDATED")?;
    let user = verified_webhook.data::<clerk_rs::models::User>()?;

    user.id.clone().inspect(|id| {
        tracing::debug!("User updated: id:{id}");
    });

    db.update_user(&user.id.clone().unwrap_or_default(), user)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}
