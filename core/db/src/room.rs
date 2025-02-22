use crate::DB;
use models::RoomUpdate;

impl DB {
    pub async fn add_room(&mut self, room: models::Room) -> Result<(), sqlx::Error> {
        let id = room.id;
        let room_name = room.room_name;
        let creator_id = room.creator_id;
        let url = room.url;
        let expired_at = room.expired_at;
        let created_at = room.created_at;

        let query = sqlx::query!(
            r#"INSERT INTO rooms (id, room_name, creator_id, url, expired_at, created_at) VALUES (?, ?, ?, ?, ?, ?)"#,
            id,
            room_name,
            creator_id,
            url,
            expired_at,
            created_at
        );

        self.execute(query).await?;

        Ok(())
    }

    pub async fn delete_room(&mut self, room_id: &str) -> Result<(), sqlx::Error> {
        let query = sqlx::query!(r#"DELETE FROM rooms WHERE id = ?"#, room_id);

        self.execute(query).await?;

        Ok(())
    }

    pub async fn update_room(
        &mut self,
        room_id: &str,
        room_update: RoomUpdate,
    ) -> Result<models::Room, sqlx::Error> {
        if let Some(creator_id) = room_update.creator_id {
            let query = sqlx::query!(
                r#"UPDATE rooms SET creator_id = ? WHERE id = ?"#,
                creator_id,
                room_id
            );
            self.execute(query).await?;
        }

        if let Some(expired_at) = room_update.expired_at {
            let query = sqlx::query!(
                r#"UPDATE rooms SET expired_at = ? WHERE id = ?"#,
                expired_at,
                room_id
            );
            self.execute(query).await?;
        }

        let updated_room = self.get_room(room_id).await?;
        Ok(updated_room)
    }

    pub async fn get_room(&self, room_id: &str) -> Result<models::Room, sqlx::Error> {
        let room = sqlx::query_as(
            r#"SELECT id, room_name, creator_id, url, expired_at, created_at FROM rooms WHERE id = ?"#,
        )
        .bind(room_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(room)
    }

    pub async fn get_user_rooms(&self, user_id: &str) -> Result<Vec<models::Room>, sqlx::Error> {
        let rooms = sqlx::query_as!(
            models::Room,
            r#"
            SELECT
                r.id,
                r.room_name,
                r.creator_id,
                r.url,
                r.expired_at,
                r.created_at
            FROM rooms r
            INNER JOIN participants p ON r.id = p.room_id
            WHERE p.user_id = ?
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(rooms)
    }

    pub async fn get_room_participants(
        &self,
        room_id: &str,
    ) -> Result<Vec<models::User>, sqlx::Error> {
        let users = sqlx::query_as!(
            models::User,
            r#"
            SELECT
                u.id,
                u.nickname,
                u.introduction,
                u.created_at
            FROM users u
            INNER JOIN participants p ON u.id = p.user_id
            WHERE p.room_id = ?
            "#,
            room_id
        )
        .fetch_all(&self.pool)
        .await?;

        Ok(users)
    }
}

#[cfg(test)]
mod test {
    use super::DB;
    use models::RoomUpdate;
    use sqlx::{
        types::chrono::{TimeZone, Utc},
        MySqlPool,
    };

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user"))]
    pub async fn add_room_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);

        db.add_room(models::Room {
            id: "sample".to_owned(),
            room_name: "sample".to_owned(),
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
    pub async fn delete_room_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);
        db.delete_room("0").await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user", "room"))]
    pub async fn update_room_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let date = Utc.with_ymd_and_hms(2021, 1, 1, 0, 0, 0).unwrap();
        let mut db = DB::from_pool(pool);
        db.update_room(
            "0",
            RoomUpdate {
                name: None,
                creator_id: None,
                expired_at: Some(Some(date)),
            },
        )
        .await?;
        let room = db.get_room("0").await?;
        assert_eq!(room.expired_at, Some(date));

        db.update_room(
            "0",
            RoomUpdate {
                name: None,
                creator_id: Some(None),
                expired_at: None,
            },
        )
        .await?;
        let room = db.get_room("0").await?;
        assert_eq!(room.creator_id, None);
        assert_eq!(room.expired_at, Some(date));

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "participant")
    )]
    pub async fn get_user_rooms_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let db = DB::from_pool(pool);
        let rooms = db.get_user_rooms("0").await?;

        assert!(!rooms.is_empty());
        assert_eq!(rooms.len(), 1);
        assert_eq!(rooms[0].id, "0");

        Ok(())
    }

    #[sqlx::test(
        migrations = "../../db/migrations",
        fixtures("user", "room", "participant")
    )]
    pub async fn get_room_participants_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);
        let users: Vec<models::User> = db.get_room_participants("0").await?;

        assert!(!users.is_empty());
        assert_eq!(users.len(), 1);
        assert_eq!(users[0].id, "0");

        db.add_participant(models::Participant {
            room_id: "0".to_owned(),
            user_id: "1".to_owned(),
            joined_at: Utc::now(),
        })
        .await?;

        let users_multiple: Vec<models::User> = db.get_room_participants("0").await?;
        assert_eq!(users_multiple.len(), 2);

        Ok(())
    }
}
