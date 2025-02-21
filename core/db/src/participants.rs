use crate::DB;

impl DB {
    pub async fn add_participant(
        &mut self,
        participant: models::Participant,
    ) -> Result<(), sqlx::Error> {
        let room_id = participant.room_id;
        let user_id = participant.user_id;
        let joined_at = participant.joined_at;

        let query = sqlx::query!(
            r#"INSERT INTO participants (room_id, user_id, joined_at) VALUES (?, ?, ?)"#,
            room_id,
            user_id,
            joined_at
        );

        self.execute(query).await?;

        Ok(())
    }

    pub async fn remove_participant(
        &mut self,
        room_id: &str,
        user_id: &str,
    ) -> Result<(), sqlx::Error> {
        let query = sqlx::query!(
            r#"DELETE FROM participants WHERE room_id = ? AND user_id = ?"#,
            room_id,
            user_id
        );

        self.execute(query).await?;

        Ok(())
    }

    pub async fn get_participant(
        &self,
        room_id: &str,
        user_id: &str,
    ) -> Result<models::Participant, sqlx::Error> {
        let participant = sqlx::query_as(
            r#"SELECT room_id, user_id, joined_at FROM participants WHERE room_id = ? AND user_id = ?"#,
        )
        .bind(room_id)
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(participant)
    }
}

#[cfg(test)]
mod test {
    use super::DB;
    use sqlx::{types::chrono::Utc, MySqlPool};

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user", "room"))]
    pub async fn add_participant_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);

        db.add_participant(models::Participant {
            room_id: "0".to_owned(),
            user_id: "0".to_owned(),
            joined_at: Utc::now(),
        })
        .await?;

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "participant")
    )]
    pub async fn get_participant_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let db = DB::from_pool(pool);
        let _ = db.get_participant("0", "0").await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user", "room"))]
    pub async fn remove_participant_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);
        db.remove_participant("0", "0").await?;

        Ok(())
    }
}
