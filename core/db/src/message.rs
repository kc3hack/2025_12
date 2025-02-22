use crate::DB;
use models::MessageUpdate;
use sqlx::types::chrono::{DateTime, Utc};

#[derive(sqlx::FromRow)]
pub struct MessageWithReply {
    pub message_id: String,
    pub message_user_id: Option<String>,
    pub message_room_id: String,
    pub message_content: String,
    pub message_reply_to_id: Option<String>,
    pub message_created_at: DateTime<Utc>,
    pub reply_message_id: Option<String>,
    pub reply_message_user_id: Option<String>,
    pub reply_message_room_id: Option<String>,
    pub reply_message_content: Option<String>,
    pub reply_message_reply_to_id: Option<String>,
    pub reply_message_created_at: Option<DateTime<Utc>>,
}

impl MessageWithReply {
    pub fn into_message_pair(self) -> (models::Message, Option<models::Message>) {
        let message = models::Message {
            id: self.message_id,
            user_id: self.message_user_id,
            room_id: self.message_room_id,
            content: self.message_content,
            reply_to_id: self.message_reply_to_id,
            created_at: self.message_created_at,
        };
        let reply_message = if let Some(reply_message_id) = self.reply_message_id {
            if let (
                Some(reply_message_room_id),
                Some(reply_message_content),
                Some(reply_message_created_at),
            ) = (
                self.reply_message_room_id,
                self.reply_message_content,
                self.reply_message_created_at,
            ) {
                Some(models::Message {
                    id: reply_message_id,
                    user_id: self.reply_message_user_id,
                    room_id: reply_message_room_id,
                    content: reply_message_content,
                    reply_to_id: self.reply_message_reply_to_id,
                    created_at: reply_message_created_at,
                })
            } else {
                None
            }
        } else {
            None
        };
        (message, reply_message)
    }
}

impl DB {
    pub async fn add_message(&mut self, message: models::Message) -> Result<(), sqlx::Error> {
        let id = message.id;
        let user_id = message.user_id;
        let room_id = message.room_id;
        let content = message.content;
        let reply_to_id = message.reply_to_id;
        let created_at = message.created_at;

        let query = sqlx::query!(
            r#"INSERT INTO messages (id, user_id, room_id, content, reply_to_id, created_at) VALUES (?, ?, ?, ?, ?, ?)"#,
            id,
            user_id,
            room_id,
            content,
            reply_to_id,
            created_at
        );

        self.execute(query).await?;

        Ok(())
    }

    pub async fn delete_message(&mut self, message_id: &str) -> Result<(), sqlx::Error> {
        let query = sqlx::query!(r#"DELETE FROM messages WHERE id = ?"#, message_id);

        self.execute(query).await?;

        Ok(())
    }

    pub async fn update_message(
        &mut self,
        id: &str,
        message_option: MessageUpdate,
    ) -> Result<(), sqlx::Error> {
        if let Some(user_id) = message_option.user_id {
            let query = sqlx::query!(
                r#"UPDATE messages SET user_id = ? WHERE id = ?"#,
                user_id,
                id
            );
            self.execute(query).await?;
        }

        if let Some(content) = message_option.content {
            let query = sqlx::query!(
                r#"UPDATE messages SET content = ? WHERE id = ?"#,
                content,
                id
            );
            self.execute(query).await?;
        }

        Ok(())
    }

    pub async fn get_message(&self, message_id: &str) -> Result<models::Message, sqlx::Error> {
        let message = sqlx::query_as(
            r#"SELECT id, user_id, room_id, content, reply_to_id, created_at FROM messages WHERE id = ?"#,
        )
        .bind(message_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(message)
    }

    pub async fn get_latest_messages(
        &self,
        room_id: &str,
        limit: u32,
    ) -> Result<Vec<(models::Message, Option<models::Message>)>, sqlx::Error> {
        let messages_with_reply = sqlx::query_as!(
            MessageWithReply,
            r#"
            SELECT
                m1.id AS message_id,
                m1.user_id AS message_user_id,
                m1.room_id AS message_room_id,
                m1.content AS message_content,
                m1.reply_to_id AS message_reply_to_id,
                m1.created_at AS message_created_at,
                m2.id AS reply_message_id,
                m2.user_id AS reply_message_user_id,
                m2.room_id AS reply_message_room_id,
                m2.content AS reply_message_content,
                m2.reply_to_id AS reply_message_reply_to_id,
                m2.created_at AS reply_message_created_at
            FROM messages m1
            LEFT JOIN messages m2 ON m1.reply_to_id = m2.id
            WHERE m1.room_id = ?
            ORDER BY m1.created_at DESC
            LIMIT ?
            "#,
            room_id,
            limit
        )
        .fetch_all(&self.pool)
        .await?
        .into_iter()
        .map(|row| row.into_message_pair())
        .collect();

        Ok(messages_with_reply)
    }

    pub async fn get_older_messages(
        &self,
        room_id: &str,
        last_created_at: DateTime<Utc>,
        limit: u32,
    ) -> Result<Vec<(models::Message, Option<models::Message>)>, sqlx::Error> {
        let messages_with_reply = sqlx::query_as!(
            MessageWithReply,
            r#"
            SELECT
                m1.id AS message_id,
                m1.user_id AS message_user_id,
                m1.room_id AS message_room_id,
                m1.content AS message_content,
                m1.reply_to_id AS message_reply_to_id,
                m1.created_at AS message_created_at,
                m2.id AS reply_message_id,
                m2.user_id AS reply_message_user_id,
                m2.room_id AS reply_message_room_id,
                m2.content AS reply_message_content,
                m2.reply_to_id AS reply_message_reply_to_id,
                m2.created_at AS reply_message_created_at
            FROM messages m1
            LEFT JOIN messages m2 ON m1.reply_to_id = m2.id
            WHERE m1.room_id = ? AND m1.created_at < ?
            ORDER BY m1.created_at DESC
            LIMIT ?
            "#,
            room_id,
            last_created_at,
            limit
        )
        .fetch_all(&self.pool)
        .await?
        .into_iter()
        .map(|row| row.into_message_pair())
        .collect();

        Ok(messages_with_reply)
    }
}

#[cfg(test)]
mod test {
    use super::DB;
    use models::MessageUpdate;
    use sqlx::{types::chrono::Utc, MySqlPool};

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user", "room"))]
    pub async fn add_message_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);

        db.add_message(models::Message {
            id: "sample".to_owned(),
            user_id: Some("0".to_owned()),
            room_id: "0".to_owned(),
            content: "doumo".to_owned(),
            reply_to_id: None,
            created_at: Utc::now(),
        })
        .await?;

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "message")
    )]
    pub async fn get_message_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let db = DB::from_pool(pool);
        let _ = db.get_message("0").await?;

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "message")
    )]
    pub async fn delete_message_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);
        db.delete_message("0").await?;

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "message")
    )]
    pub async fn update_message_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);
        db.update_message(
            "0",
            MessageUpdate {
                user_id: None,
                content: Some("changed-message".to_owned()),
            },
        )
        .await?;
        let message = db.get_message("0").await?;
        assert_eq!(message.user_id, Some("0".to_owned()));

        db.update_message(
            "0",
            MessageUpdate {
                user_id: Some(None),
                content: Some("changed-message".to_owned()),
            },
        )
        .await?;
        let message = db.get_message("0").await?;
        assert_eq!(message.user_id, None);
        assert_eq!(message.content, "changed-message");

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "messages_for_reply")
    )]
    pub async fn get_latest_messages_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let db = DB::from_pool(pool);
        let room_id = "0";
        let limit = 20;
        let latest_messages = db.get_latest_messages(room_id, limit).await?;

        assert_eq!(latest_messages.len(), 3);
        assert!(latest_messages.iter().any(|message| message.1.is_some()));

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "messages_for_reply")
    )]
    pub async fn get_older_messages_with_reply_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let db = DB::from_pool(pool);
        let room_id = "0";

        let latest_messages = db.get_latest_messages(room_id, 1).await?;

        assert!(!latest_messages.is_empty());

        let latest_message = &latest_messages.last().unwrap().0;

        let older_messages = db
            .get_older_messages(room_id, latest_message.created_at, 2)
            .await?;

        assert_eq!(older_messages.len(), 2);

        Ok(())
    }
}
