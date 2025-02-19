use crate::DB;
use sqlx::types::chrono::{DateTime, Utc};

impl DB {
    pub async fn add_room(&mut self, user: models::Room) -> Result<(), sqlx::Error> {
        let id = user.id;
        let creator_id = user.creator_id;
        let url = user.url;
        let expired_at = user.expired_at;
        let created_at = user.created_at;

        let query = sqlx::query!(
            "INSERT INTO rooms (id, creator_id, url, expired_at, created_at) VALUES (?, ?, ?, ?, ?)",
            id,
            creator_id,
            url,
            expired_at,
            created_at
        );

        self.execute(query).await?;

        Ok(())
    }

    pub async fn remove_room(&mut self, room_id: &str) -> Result<(), sqlx::Error> {
        let query = sqlx::query!("DELETE FROM rooms WHERE id = ?", room_id);

        self.execute(query).await?;

        Ok(())
    }

    pub async fn update_room(
        &mut self,
        room_id: &str,
        creator_id: Option<Option<&str>>,
        expired_at: Option<DateTime<Utc>>,
    ) -> Result<(), sqlx::Error> {
        if let Some(creator_id) = creator_id {
            let query = sqlx::query!(
                "UPDATE rooms SET creator_id = ? WHERE id = ?",
                creator_id,
                room_id
            );
            self.execute(query).await?;
        }

        if let Some(expired_at) = expired_at {
            let query = sqlx::query!(
                "UPDATE rooms SET expired_at = ? WHERE id = ?",
                expired_at,
                room_id
            );
            self.execute(query).await?;
        }

        Ok(())
    }

    pub async fn get_room(&self, room_id: &str) -> Result<models::Room, sqlx::Error> {
        let room = sqlx::query_as(
            "SELECT id, creator_id, url, expired_at, created_at FROM rooms WHERE id = ?",
        )
        .bind(room_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(room)
    }
}

#[cfg(test)]
mod test {
    use super::DB;
    use sqlx::{
        types::chrono::{TimeZone, Utc},
        MySqlPool,
    };

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user"))]
    pub async fn add_room_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);

        db.add_room(models::Room {
            id: "sample".to_owned(),
            creator_id: Some("0".to_owned()),
            url: "url".to_owned(),
            expired_at: None,
            created_at: Utc::now(),
        })
        .await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user", "room"))]
    pub async fn get_room_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let db = DB::from_pool(pool);
        let _ = db.get_room("0").await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user", "room"))]
    pub async fn remove_room_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);
        db.remove_room("0").await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user", "room"))]
    pub async fn update_room_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let date = Utc.with_ymd_and_hms(2021, 1, 1, 0, 0, 0).unwrap();
        let mut db = DB::from_pool(pool);
        db.update_room("0", None, Some(date)).await?;
        let room = db.get_room("0").await?;
        assert_eq!(room.expired_at, Some(date));

        db.update_room("0", Some(None), None).await?;
        let room = db.get_room("0").await?;
        assert_eq!(room.creator_id, None);
        assert_eq!(room.expired_at, Some(date));

        Ok(())
    }
}
