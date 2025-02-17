mod clerk;

use axum::{
    extract::State,
    http::{HeaderMap, StatusCode},
    response::Json,
    routing::{get, post},
    Extension, Router,
};
use clerk::webhook_signup;
use clerk_rs::{clerk::Clerk, ClerkConfiguration};
use db::{DBOption, DB};
use std::{env, sync::Arc, time::Duration};
use tokio::sync::Mutex;
use tracing_subscriber::{layer::SubscriberExt as _, util::SubscriberInitExt as _};

struct AppState {
    db: Mutex<DB>,
}

impl AppState {
    fn new(db: DB) -> Arc<Self> {
        let mutex_db = Mutex::new(db);
        let app_state = AppState { db: mutex_db };
        Arc::new(app_state)
    }
}

#[tokio::main]
async fn main() {
    dotenvy::dotenv().unwrap();

    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| format!("{}=trace", env!("CARGO_CRATE_NAME")).into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let config = ClerkConfiguration::new(None, None, Some("your_secret_key".to_string()), None);
    let clerk = Clerk::new(config);

    let db = DB::from_option(DBOption {
        max_connections: 5,
        acquire_timeout: Duration::from_secs(3),
    })
    .await;

    let app_state = AppState::new(db);

    let app = Router::new()
        .route("/users/me", get(get_user_me))
        .route("/webhooks/signup", post(webhook_signup))
        .layer(Extension(clerk))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3050").await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());

    axum::serve(listener, app).await.unwrap();
}

#[axum::debug_handler]
async fn get_user_me(
    State(state): State<Arc<AppState>>,
    headers: HeaderMap,
) -> Result<Json<models::User>, StatusCode> {
    let db = state.db.lock().await;
    let user_id = clerk::get_user_id(headers);

    let id = db
        .get_user(&user_id)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    Ok(Json(id))
}
