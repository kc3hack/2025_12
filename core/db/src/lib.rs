pub mod error;
mod message;
mod participants;
mod room;
mod user;

use sqlx::{
    mysql::{MySqlArguments, MySqlPoolOptions},
    query::Query,
    Error, MySql, MySqlPool, Transaction,
};
use std::time::Duration;

pub struct DBOption {
    pub max_connections: u32,
    pub acquire_timeout: Duration,
}

#[derive(Debug)]
pub struct DB {
    pool: MySqlPool,
    transaction: Option<Transaction<'static, MySql>>,
}

impl DB {
    pub async fn new(db_url: &str, option: DBOption) -> Self {
        let pool = MySqlPoolOptions::new()
            .max_connections(option.max_connections)
            .acquire_timeout(option.acquire_timeout)
            .connect(db_url)
            .await
            .expect("Cannot connect to database");

        DB {
            pool,
            transaction: None,
        }
    }

    pub async fn from_option(option: DBOption) -> Self {
        let db_url = std::env::var("DATABASE_URL").expect("Failed to get URL");
        DB::new(&db_url, option).await
    }

    pub fn from_pool(pool: MySqlPool) -> Self {
        DB {
            pool,
            transaction: None,
        }
    }

    pub async fn execute(&mut self, query: Query<'_, MySql, MySqlArguments>) -> Result<(), Error> {
        if let Some(ref mut t) = self.transaction {
            query.execute(&mut **t).await?;
        } else {
            query.execute(&self.pool).await?;
        }
        Ok(())
    }

    pub async fn enable_rollback(mut self) -> Result<Self, Error> {
        let tx = self.pool.begin().await?;
        self.transaction = Some(tx);
        Ok(self)
    }

    pub async fn rollback(&mut self) -> Result<(), Error> {
        if let Some(tx) = self.transaction.take() {
            tx.rollback().await?;
        }
        Ok(())
    }

    pub async fn commit(&mut self) -> Result<(), Error> {
        if let Some(tx) = self.transaction.take() {
            tx.commit().await?;
        }
        Ok(())
    }
}
