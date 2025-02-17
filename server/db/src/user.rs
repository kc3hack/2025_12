use crate::DB;
use sqlx::types::chrono::{DateTime, Utc};

impl DB {
    pub async fn add_user(&mut self, user: models::User) -> Result<(), sqlx::Error> {
        let id = user.id;
        let nickname = user.nickname;
        let created_at = user.created_at;

        let query = sqlx::query!(
            "INSERT INTO users (id, nickname, created_at) VALUES (?, ?, ?)",
            id,
            nickname,
            created_at
        );

        self.execute(query).await?;

        Ok(())
    }

    pub async fn remove_user(&mut self, user_id: &str) -> Result<(), sqlx::Error> {
        let query = sqlx::query!("DELETE FROM users WHERE id = ?", user_id);

        self.execute(query).await?;

        Ok(())
    }

    pub async fn update_user(
        &mut self,
        user_id: &str,
        nickname: Option<&str>,
        introduction: Option<&str>,
        created_at: Option<DateTime<Utc>>,
    ) -> Result<(), sqlx::Error> {
        if let Some(nickname) = nickname {
            let query = sqlx::query!(
                "UPDATE users SET nickname = ? WHERE id = ?",
                nickname,
                user_id
            );
            self.execute(query).await?;
        }

        if let Some(introduction) = introduction {
            let query = sqlx::query!(
                "UPDATE users SET introduction = ? WHERE id = ?",
                introduction,
                user_id
            );
            self.execute(query).await?;
        }

        if let Some(created_at) = created_at {
            let query = sqlx::query!(
                "UPDATE users SET created_at = ? WHERE id = ?",
                created_at,
                created_at
            );
            self.execute(query).await?;
        }

        Ok(())
    }

    pub async fn get_user(&self, user_id: &str) -> Result<models::User, sqlx::Error> {
        let user =
            sqlx::query_as("SELECT id, nickname, introduction, created_at FROM users WHERE id = ?")
                .bind(user_id)
                .fetch_one(&self.pool)
                .await?;

        Ok(user)
    }
}

#[cfg(test)]
mod test {
    use super::DB;
    use sqlx::{types::chrono::Utc, MySqlPool};

    #[sqlx::test(migrations = "../../db/migrations")]
    pub async fn add_user_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        dotenvy::dotenv().unwrap();

        let mut db = DB::from_pool(pool);

        db.add_user(models::User {
            id: "sample".to_owned(),
            nickname: "sample_user".to_owned(),
            introduction: Some("hello".to_owned()),
            created_at: Utc::now(),
        })
        .await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user"))]
    pub async fn get_user_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        dotenvy::dotenv().unwrap();

        let db = DB::from_pool(pool);
        let _ = db.get_user("0").await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user"))]
    pub async fn remove_user_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        dotenvy::dotenv().unwrap();

        let mut db = DB::from_pool(pool);
        db.remove_user("0").await?;

        Ok(())
    }

    #[sqlx::test(migrations = "../../db/migrations", fixtures("user"))]
    pub async fn update_user_test(pool: MySqlPool) -> Result<(), sqlx::Error> {
        dotenvy::dotenv().unwrap();

        let mut db = DB::from_pool(pool);
        db.update_user("0", Some("changed-user"), None, None)
            .await?;

        let user = db.get_user("0").await?;
        assert_eq!(user.nickname, "changed-user");

        Ok(())
    }
}
