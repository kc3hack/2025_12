use models::UserUpdate;

use crate::DB;

impl DB {
    pub async fn add_user(&mut self, user: impl Into<models::User>) -> Result<(), sqlx::Error> {
        let user = user.into();

        let id = user.id;
        let nickname = user.nickname;
        let created_at = user.created_at;

        let query = sqlx::query!(
            r#"INSERT INTO users (id, nickname, created_at) VALUES (?, ?, ?)"#,
            id,
            nickname,
            created_at
        );

        self.execute(query).await?;

        Ok(())
    }

    pub async fn delete_user(&mut self, user_id: &str) -> Result<(), sqlx::Error> {
        let query = sqlx::query!(r#"DELETE FROM users WHERE id = ?"#, user_id);

        self.execute(query).await?;

        Ok(())
    }

    pub async fn update_user(
        &mut self,
        user_id: &str,
        user_option: impl Into<UserUpdate>,
    ) -> Result<(), sqlx::Error> {
        let user_option = user_option.into();

        if let Some(nickname) = user_option.nickname {
            let query = sqlx::query!(
                r#"UPDATE users SET nickname = ? WHERE id = ?"#,
                nickname,
                user_id
            );
            self.execute(query).await?;
        }

        if let Some(introduction) = user_option.introduction {
            let query = sqlx::query!(
                r#"UPDATE users SET introduction = ? WHERE id = ?"#,
                introduction,
                user_id
            );
            self.execute(query).await?;
        }

        Ok(())
    }

    pub async fn get_user(&self, user_id: &str) -> Result<models::User, sqlx::Error> {
        let user = sqlx::query_as(
            r#"SELECT id, nickname, introduction, created_at FROM users WHERE id = ?"#,
        )
        .bind(user_id)
        .fetch_one(&self.pool)
        .await?;

        Ok(user)
    }
}

#[cfg(test)]
mod test {
    use super::DB;
    use models::UserUpdate;
    use sqlx::{types::chrono::Utc, MySqlPool};

    #[sqlx::test(migrations = "../../db/migrations")]
    pub async fn add_user_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);

        db.add_user(models::User {
            id: "sample".to_owned(),
            nickname: Some("sample_user".to_owned()),
            introduction: Some("hello".to_owned()),
            created_at: Utc::now(),
        })
        .await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user"))]
    pub async fn get_user_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let db = DB::from_pool(pool);
        let _ = db.get_user("0").await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user"))]
    pub async fn delete_user_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);
        db.delete_user("0").await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user"))]
    pub async fn update_user_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        let mut db = DB::from_pool(pool);
        db.update_user(
            "0",
            UserUpdate {
                nickname: Some(Some("changed-user".to_owned())),
                introduction: None,
            },
        )
        .await?;

        let user = db.get_user("0").await?;
        assert_eq!(user.nickname, Some("changed-user".to_owned()));

        Ok(())
    }
}
