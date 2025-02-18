use crate::AppState;
use axum::{
    body::Bytes,
    extract::State,
    http::{HeaderMap, StatusCode},
};
use base64::Engine as _;
use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use std::{env, sync::Arc};

pub fn get_user_id(header: HeaderMap) -> String {
    #[derive(Serialize, Deserialize)]
    struct Claims {
        sub: String,
    }

    let payload = header
        .get("authorization")
        .unwrap()
        .to_str()
        .unwrap()
        .split(".")
        .collect::<Vec<_>>()[1];

    let bytes = base64::engine::GeneralPurpose::new(
        &base64::alphabet::URL_SAFE,
        base64::engine::general_purpose::NO_PAD,
    )
    .decode(payload)
    .unwrap();

    let claims: Claims = serde_json::from_str(String::from_utf8(bytes).unwrap().as_str()).unwrap();

    claims.sub
}

#[axum::debug_handler]
#[utoipa::path(
    get,
    path = "/webhook/signup",
    summary = "Webhook Signup",
    request_body(
        content = String,
        content_type = "application/octet-stream",
        description = "Raw binary data"
    ),
    description = "Clerkからユーザーがアカウント登録したときに呼ばれるWebhook",
    responses(
        (status = 200, description = "OK"),
        (status = 400, description = "Bad Request"),
        (status = 500, description = "Internal Server Error")
    ),
)]
pub async fn webhook_signup(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<StatusCode, StatusCode> {
    let mut db = state.db.lock().await;

    tracing::debug!("webhook received");

    let signing_secret =
        env::var("SIGNING_SECRET").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let wh = svix::webhooks::Webhook::new(&signing_secret)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if wh.verify(&body, &headers).is_err() {
        return Err(StatusCode::BAD_REQUEST);
    }

    tracing::debug!("svix verify successed");

    let wh_value =
        serde_json::from_slice::<serde_json::Value>(&body).map_err(|_| StatusCode::BAD_REQUEST)?;

    let data_value = wh_value.get("data").ok_or(StatusCode::BAD_REQUEST)?;

    let user = serde_json::from_value::<clerk_rs::models::User>(data_value.clone())
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    user.id.clone().inspect(|id| {
        tracing::debug!("User Signed up: id:{id}");
    });

    let created_at = user
        .created_at
        .and_then(DateTime::<Utc>::from_timestamp_millis)
        .unwrap_or_else(Utc::now);

    db.add_user(models::User {
        id: user.id.unwrap(),
        nickname: "".to_owned(),
        introduction: Some("".to_owned()),
        created_at,
    })
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(StatusCode::OK)
}
