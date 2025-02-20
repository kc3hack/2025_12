mod api;
mod clerk;
mod webhook;
mod websocket;

use api::user::{get_user, get_user_me};
use axum::{
    routing::{get, post},
    Extension, Router,
};
use clerk_rs::{clerk::Clerk, ClerkConfiguration};
use db::{DBOption, DB};
use models::Room;
use std::{collections::HashMap, env, sync::Arc, time::Duration};
use tokio::sync::{broadcast, Mutex};
use tracing_subscriber::{layer::SubscriberExt as _, util::SubscriberInitExt as _};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use webhook::{webhook_user_deleted, webhook_user_signup, webhook_user_updated};
use websocket::{websocket_handler, EventFromServer};

#[derive(Debug)]
struct AppState {
    db: Mutex<DB>,
    room_tx: Mutex<HashMap<String, broadcast::Sender<EventFromServer>>>,
}

impl AppState {
    fn new(db: DB) -> Arc<Self> {
        let mutex_db = Mutex::new(db);
        let app_state = AppState {
            db: mutex_db,
            room_tx: Mutex::new(HashMap::new()),
        };
        Arc::new(app_state)
    }

    async fn join(&self, room_id: &str) -> Result<Room, ()> {
        let mut room_tx = self.room_tx.lock().await;

        let db = self.db.lock().await;
        let room = db.get_room(room_id).await.unwrap();

        if !room_tx.contains_key(room_id) {
            let (tx, _rx) = broadcast::channel(100);
            room_tx.insert(room.id.clone(), tx);
        }

        Ok(room)
    }
}

#[tokio::main]
async fn main() {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| format!("{}=trace", env!("CARGO_CRATE_NAME")).into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let clerk_secret_key = env::var("CLERK_SECRET_KEY").expect("Clerk secret key not found");
    let config = ClerkConfiguration::new(None, None, Some(clerk_secret_key), None);
    let clerk = Clerk::new(config);

    let db = DB::from_option(DBOption {
        max_connections: 5,
        acquire_timeout: Duration::from_secs(3),
    })
    .await;

    let app_state = AppState::new(db);

    let app = Router::new()
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .route("/users/me", get(get_user_me))
        .route("/users/{id}", get(get_user))
        .route("/webhooks/user_signup", post(webhook_user_signup))
        .route("/webhooks/user_deleted", post(webhook_user_deleted))
        .route("/webhooks/user_updated", post(webhook_user_updated))
        .route("/websocket/{room_id}", get(websocket_handler))
        .layer(Extension(clerk))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3050").await.unwrap();
    tracing::debug!("listening on {}", listener.local_addr().unwrap());

    tracing::debug!("you can see swagger here: http://localhost:3050/swagger-ui",);

    axum::serve(listener, app).await.unwrap();
}

#[derive(OpenApi)]
#[openapi(
    paths(
        api::user::get_user,
        api::user::get_user_me,
        webhook::webhook_user_signup,
        webhook::webhook_user_deleted,
        webhook::webhook_user_updated,
    ),
    components(schemas(
        models::User,
    )),
    tags((name = "User"))
)]
struct ApiDoc;
