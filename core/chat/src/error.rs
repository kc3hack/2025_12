use axum::http::StatusCode;

#[derive(thiserror::Error, Debug)]
pub enum CoreError {
    #[error("Error: {}", error)]
    Error { error: String },

    #[error("Authorization failed: {}", .0)]
    AuthError(&'static str),

    #[error("Deserialize failed: {}", error)]
    DeserializeError { error: serde_json::Error },

    #[error("Serialize failed")]
    SerializeError,
}

impl From<CoreError> for StatusCode {
    fn from(error: CoreError) -> Self {
        match error {
            CoreError::AuthError(_) => StatusCode::UNAUTHORIZED,
            _ => StatusCode::INTERNAL_SERVER_ERROR,
        }
    }
}
