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

#[tracing::instrument(skip_all)]
pub fn get_user_id(headers: HeaderMap) -> String {
    #[derive(Serialize, Deserialize)]
    struct Claims {
        sub: String,
    }

    let payload = headers
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
