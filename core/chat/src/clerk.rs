use axum::{
    body::Bytes,
    http::{HeaderMap, StatusCode},
};
use base64::Engine as _;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::env;

#[allow(dead_code)]
pub struct VerifiedWebhook {
    body: Bytes,
    headers: HeaderMap,
}

impl VerifiedWebhook {
    pub fn data<T: DeserializeOwned>(self) -> Result<T, StatusCode> {
        let wh_value = serde_json::from_slice::<serde_json::Value>(&self.body)
            .map_err(|_| StatusCode::BAD_REQUEST)?;
        let data_value = wh_value.get("data").ok_or(StatusCode::BAD_REQUEST)?;
        let data =
            serde_json::from_value(data_value.clone()).map_err(|_| StatusCode::BAD_REQUEST)?;

        Ok(data)
    }
}

pub fn get_bearer_from_header(headers: &HeaderMap) -> Result<&str, ()> {
    let auth_header = headers.get("authorization").ok_or(())?;
    let auth_str = auth_header.to_str().map_err(|_| ())?;

    if !auth_str.starts_with("Bearer ") {
        return Err(());
    }

    Ok(&auth_str[7..])
}

#[tracing::instrument(skip_all)]
pub fn get_payload_from_token(token: &str) -> Result<String, ()> {
    let parts: Vec<&str> = token.split(".").collect();

    if parts.len() != 3 {
        return Err(());
    }

    Ok(parts[1].to_string())
}

#[tracing::instrument(skip_all)]
pub fn get_authenticated_user_id(payload: String) -> Result<String, ()> {
    #[derive(Serialize, Deserialize)]
    struct Claims {
        sub: String,
    }

    let bytes = base64::engine::GeneralPurpose::new(
        &base64::alphabet::URL_SAFE,
        base64::engine::general_purpose::NO_PAD,
    )
    .decode(payload)
    .map_err(|_| ())?;

    let claims: Claims =
        serde_json::from_str(String::from_utf8(bytes).unwrap().as_str()).map_err(|_| ())?;
    Ok(claims.sub)
}

#[tracing::instrument(skip_all)]
pub fn verify_webhook(
    body: Bytes,
    headers: HeaderMap,
    signing_secret_name: &str,
) -> Result<VerifiedWebhook, StatusCode> {
    let signing_secret =
        env::var(signing_secret_name).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let wh = svix::webhooks::Webhook::new(&signing_secret)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    if wh.verify(&body, &headers).is_err() {
        return Err(StatusCode::BAD_REQUEST);
    }

    tracing::debug!("svix verify succeeded");

    Ok(VerifiedWebhook { body, headers })
}

pub trait ExtractPayload {
    fn extract_payload(&self) -> Result<String, ()>;
}

impl ExtractPayload for HeaderMap {
    fn extract_payload(&self) -> Result<String, ()> {
        let token = get_bearer_from_header(self)?;
        let payload = get_payload_from_token(token)?;
        Ok(payload)
    }
}
