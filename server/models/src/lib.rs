use sqlx::types::chrono::{DateTime, Utc};

#[derive(sqlx::FromRow)]
pub struct User {
    pub id: String,
    pub nickname: String,
    pub introduction: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(sqlx::FromRow)]
pub struct Room {
    pub id: String,
    pub creator_id: Option<String>,
    pub url: String,
    pub expired_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(sqlx::FromRow)]
pub struct Participant {
    pub room_id: String,
    pub user_id: String,
    pub joined_at: DateTime<Utc>,
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
