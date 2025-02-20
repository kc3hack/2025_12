pub trait IntoStatusCode<T> {
    fn into_statuscode(self) -> Result<T, http::StatusCode>;
}

impl<T> IntoStatusCode<T> for Result<T, sqlx::Error> {
    fn into_statuscode(self) -> Result<T, http::StatusCode> {
        match self {
            Ok(v) => Ok(v),
            Err(err) => Err(match err {
                sqlx::Error::Configuration(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::Database(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::Io(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::Tls(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::Protocol(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::RowNotFound => http::StatusCode::NOT_FOUND,
                sqlx::Error::TypeNotFound { .. } => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::ColumnIndexOutOfBounds { .. } => {
                    http::StatusCode::INTERNAL_SERVER_ERROR
                }
                sqlx::Error::ColumnNotFound(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::ColumnDecode { .. } => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::Encode(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::Decode(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::AnyDriverError(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::PoolTimedOut => http::StatusCode::SERVICE_UNAVAILABLE,
                sqlx::Error::PoolClosed => http::StatusCode::SERVICE_UNAVAILABLE,
                sqlx::Error::WorkerCrashed => http::StatusCode::INTERNAL_SERVER_ERROR,
                sqlx::Error::Migrate(_) => http::StatusCode::INTERNAL_SERVER_ERROR,
                _ => http::StatusCode::INTERNAL_SERVER_ERROR,
            }),
        }
    }
}
