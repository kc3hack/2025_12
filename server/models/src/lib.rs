use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};

#[derive(sqlx::FromRow, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub nickname: Option<String>,
    pub introduction: Option<String>,
    pub created_at: DateTime<Utc>,
}

impl From<clerk_rs::models::User> for User {
    fn from(value: clerk_rs::models::User) -> Self {
        let created_at = value
            .created_at
            .and_then(DateTime::<Utc>::from_timestamp_millis)
            .unwrap_or_else(Utc::now);

        User {
            id: value.id.unwrap_or_default(),
            nickname: None,
            introduction: None,
            created_at,
        }
    }
}

#[derive(sqlx::FromRow)]
pub struct Message {
    pub id: String,
    pub room_id: String,
    pub user_id: Option<String>,
    pub content: String,
    pub reply_to_id: Option<String>,
    pub created_at: DateTime<Utc>,
}
