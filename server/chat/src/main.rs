use db::{DBOption, DB};
use std::time::Duration;

#[tokio::main]
async fn main() {
    dotenvy::dotenv().unwrap();

    let _db = DB::from_option(DBOption {
        max_connections: 10,
        acquire_timeout: Duration::from_secs(3),
    })
    .await;
}
