use models::MessageUpdate;

use crate::DB;

impl DB {
    pub async fn add_message(&mut self, message: models::Message) -> Result<(), sqlx::Error> {
        let id = message.id;
        let user_id = message.user_id;
        let room_id = message.room_id;
        let content = message.content;
        let reply_to_id = message.reply_to_id;
        let created_at = message.created_at;

        let query = sqlx::query!(
            "INSERT INTO messages (id, user_id, room_id, content, reply_to_id, created_at) VALUES (?, ?, ?, ?, ?, ?)",
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

    pub async fn remove_message(&mut self, message_id: &str) -> Result<(), sqlx::Error> {
        let query = sqlx::query!("DELETE FROM messages WHERE id = ?", message_id);

        self.execute(query).await?;

        Ok(())
    }

    pub async fn update_message(
        &mut self,
        id: &str,
        message_option: MessageUpdate,
    ) -> Result<(), sqlx::Error> {
        if let Some(user_id) = message_option.user_id {
            let query = sqlx::query!("UPDATE messages SET user_id = ? WHERE id = ?", user_id, id);
            self.execute(query).await?;
        }

        if let Some(content) = message_option.content {
            let query = sqlx::query!("UPDATE messages SET content = ? WHERE id = ?", content, id);
            self.execute(query).await?;
        }

        Ok(())
    }

    pub async fn get_message(&self, message_id: &str) -> Result<models::Message, sqlx::Error> {
        let message = sqlx::query_as(
            "SELECT id, user_id, room_id, content, reply_to_id, created_at FROM messages WHERE id = ?",
        )
        .bind(message_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(message)
    }
}

#[cfg(test)]
mod test {
    use super::DB;
    use models::MessageUpdate;
    use sqlx::{types::chrono::Utc, MySqlPool};

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user", "room"))]
    pub async fn add_message_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        dotenvy::dotenv().unwrap();

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
        dotenvy::dotenv().unwrap();

        let db = DB::from_pool(pool);
        let _ = db.get_message("0").await?;

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "message")
    )]
    pub async fn remove_message_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        dotenvy::dotenv().unwrap();

        let mut db = DB::from_pool(pool);
        db.remove_message("0").await?;

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "message")
    )]
    pub async fn update_message_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        dotenvy::dotenv().unwrap();

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
}
