use sqlx::types::chrono::{DateTime, Utc};

#[derive(sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub nickname: String,
    pub introduction: Option<String>,
    pub created_at: DateTime<Utc>,
}
