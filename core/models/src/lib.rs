pub mod websocket;

use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

#[derive(sqlx::FromRow, Serialize, Deserialize, ToSchema, Debug)]
pub struct User {
    pub id: String,
    pub nickname: Option<String>,
    pub image_url: Option<String>,
    pub introduction: Option<String>,
    pub created_at: DateTime<Utc>,
}

#[derive(Default)]
pub struct UserUpdate {
    pub nickname: Option<Option<String>>,
    pub image_url: Option<String>,
    pub introduction: Option<Option<String>>,
}

impl From<clerk_rs::models::User> for UserUpdate {
    fn from(user: clerk_rs::models::User) -> Self {
        UserUpdate {
            nickname: Some(Some(format!(
                "{} {}",
                user.last_name.flatten().unwrap_or("".to_owned()),
                user.first_name.flatten().unwrap_or("".to_owned())
            ))),
            image_url: user.image_url,
            introduction: None,
        }
    }
}

impl From<clerk_rs::models::User> for User {
    fn from(user: clerk_rs::models::User) -> Self {
        let created_at = user
            .created_at
            .and_then(DateTime::<Utc>::from_timestamp_millis)
            .unwrap_or_else(Utc::now);

        User {
            id: user.id.unwrap_or_default(),
            nickname: None,
            image_url: user.image_url,
            introduction: None,
            created_at,
        }
    }
}

#[derive(Debug, Clone, sqlx::FromRow, Serialize, Deserialize, ToSchema)]
pub struct Room {
    pub id: String,
    pub room_name: String,
    pub creator_id: Option<String>,
    pub url: String,
    pub expired_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct RoomUpdate {
    pub name: Option<String>,

    #[schema(nullable = true, format = DateTime)]
    pub creator_id: Option<Option<String>>,

    #[schema(nullable = true, format = DateTime)]
    pub expired_at: Option<Option<DateTime<Utc>>>,
}

#[derive(Debug, Deserialize, ToSchema)]
pub struct CreateRoomRequest {
    pub room_name: String,
}

#[derive(Debug, sqlx::FromRow)]
pub struct Participant {
    pub room_id: String,
    pub user_id: String,
    pub joined_at: DateTime<Utc>,
}

#[derive(ToSchema, Debug, Serialize, sqlx::FromRow)]
pub struct Message {
    pub id: String,
    pub room_id: String,
    pub user_id: Option<String>,
    pub content: String,
    pub reply_to_id: Option<String>,
    pub created_at: DateTime<Utc>,
}

pub struct MessageUpdate {
    pub user_id: Option<Option<String>>,
    pub content: Option<String>,
}
