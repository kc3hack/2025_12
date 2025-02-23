use crate::error::CoreError;
use axum::{
    body::Bytes,
    http::{HeaderMap, StatusCode},
};
use base64::Engine as _;
use derive_more::Deref;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::env;

#[derive(Deref)]
pub struct VerifiedToken(String);

impl VerifiedToken {
    pub fn new(token: &str) -> Self {
        VerifiedToken(token.to_owned())
    }

    pub fn from_headers(headers: &HeaderMap) -> Result<Self, CoreError> {
        let auth_header = headers
            .get("authorization")
            .ok_or(CoreError::AuthError("authorization field not found"))?;

        let auth_str = auth_header
            .to_str()
            .map_err(|_| CoreError::AuthError("Failed to convert headert to string"))?;

        if !auth_str.starts_with("Bearer ") {
            return Err(CoreError::AuthError("Bearer field not found"));
        }

        Ok(VerifiedToken(auth_str[7..].to_owned()))
    }

    pub fn payload(&self) -> Result<String, CoreError> {
        let parts: Vec<&str> = self.split(".").collect();
        if parts.len() != 3 {
            return Err(CoreError::AuthError("Invalid token format"));
        }

        Ok(parts[1].to_string())
    }

    pub fn user_id(&self) -> Result<String, CoreError> {
        #[derive(Serialize, Deserialize)]
        struct Claims {
            sub: String,
        }

        let bytes = base64::engine::GeneralPurpose::new(
            &base64::alphabet::URL_SAFE,
            base64::engine::general_purpose::NO_PAD,
        )
        .decode(&self.payload()?)
        .map_err(|_| CoreError::AuthError("Failed to decode payload"))?;

        let claims: Claims = serde_json::from_str(String::from_utf8(bytes).unwrap().as_str())
            .map_err(|_| CoreError::AuthError("Failed to parse claims"))?;
        Ok(claims.sub)
    }

    pub fn verify(&self) -> Result<(), CoreError> {
        let _ = base64::engine::GeneralPurpose::new(
            &base64::alphabet::URL_SAFE,
            base64::engine::general_purpose::NO_PAD,
        )
        .decode(&self.payload()?)
        .map_err(|_| CoreError::AuthError("Failed to decode payload"))?;
        Ok(())
    }
}

#[allow(dead_code)]
pub struct VerifiedWebhook {
    body: Bytes,
    headers: HeaderMap,
}

impl VerifiedWebhook {
    pub fn new(
        body: Bytes,
        headers: HeaderMap,
        signing_secret_name: &str,
    ) -> Result<VerifiedWebhook, StatusCode> {
        let signing_secret =
            env::var(signing_secret_name).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

        let wh =
            svix::webhooks::Webhook::new(&signing_secret).map_err(|_| StatusCode::BAD_REQUEST)?;

        if wh.verify(&body, &headers).is_err() {
            return Err(StatusCode::BAD_REQUEST);
        }

        tracing::debug!("svix verify succeeded");

        Ok(VerifiedWebhook { body, headers })
    }

    pub fn data<T: DeserializeOwned>(self) -> Result<T, StatusCode> {
        let wh_value = serde_json::from_slice::<serde_json::Value>(&self.body)
            .map_err(|_| StatusCode::BAD_REQUEST)?;
        let data_value = wh_value.get("data").ok_or(StatusCode::BAD_REQUEST)?;
        let data =
            serde_json::from_value(data_value.clone()).map_err(|_| StatusCode::BAD_REQUEST)?;

        Ok(data)
    }
}
