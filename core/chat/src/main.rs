mod api;
mod clerk;
mod error;
mod webhook;
mod websocket;

use api::{
    message::get_room_messages,
    room::{
        add_user_to_room, create_room, delete_room, delete_user_from_room, get_room,
        get_room_users, update_room,
    },
    user::{get_user, get_user_me, get_user_rooms},
};
use axum::{
    http::header,
    http::Method,
    routing::{delete, get, patch, post},
    Extension, Router,
};
use clerk_rs::{clerk::Clerk, ClerkConfiguration};
use db::{DBOption, DB};
use std::{collections::HashMap, env, sync::Arc, time::Duration};
use tokio::sync::{broadcast, Mutex};
use tower_http::cors::{AllowOrigin, CorsLayer};
use tracing_subscriber::{layer::SubscriberExt as _, util::SubscriberInitExt as _};
use utoipa::OpenApi;
use utoipa_swagger_ui::SwaggerUi;
use webhook::{webhook_user_deleted, webhook_user_signup, webhook_user_updated};
use websocket::{websocket_handler, InternalEvent};

#[derive(Debug)]
struct AppState {
    db: Mutex<DB>,
    room_tx: Mutex<HashMap<String, broadcast::Sender<InternalEvent>>>,
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

    async fn join(&self, room_id: &str) -> color_eyre::Result<models::Room> {
        let mut room_tx = self.room_tx.lock().await;

        let db = self.db.lock().await;
        let room = db.get_room(room_id).await?;

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
            tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| "info".into()),
        )
        .with(tracing_subscriber::fmt::layer().pretty())
        .init();

    color_eyre::install().expect("Eyre installation failed");

    let clerk_secret_key = env::var("CLERK_SECRET_KEY").expect("Clerk secret key not found");
    let config = ClerkConfiguration::new(None, None, Some(clerk_secret_key), None);
    let clerk = Clerk::new(config);

    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::exact(
            env::var("FRONTEND_URL")
                .expect("FRONTEND_URL not found")
                .parse()
                .unwrap(),
        ))
        .allow_methods(vec![Method::GET, Method::POST, Method::PUT, Method::DELETE])
        .allow_headers(vec![
            header::ACCEPT,
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
        ])
        .allow_credentials(true);

    let db = DB::from_option(DBOption {
        max_connections: 5,
        acquire_timeout: Duration::from_secs(3),
    })
    .await;

    let app_state = AppState::new(db);

    let app = Router::new()
        .merge(SwaggerUi::new("/swagger-ui").url("/api-docs/openapi.json", ApiDoc::openapi()))
        .route("/users/me", get(get_user_me))
        .route("/users/{user_id}", get(get_user))
        .route("/users/rooms", get(get_user_rooms))
        .route("/rooms", post(create_room))
        .route("/rooms/{room_id}", delete(delete_room))
        .route("/rooms/{room_id}", patch(update_room))
        .route("/rooms/{room_id}", get(get_room))
        .route("/rooms/{room_id}/users", post(add_user_to_room))
        .route("/rooms/{room_id}/users", get(get_room_users))
        .route("/rooms/{room_id}/users", delete(delete_user_from_room))
        .route("/rooms/{room_id}/messages", get(get_room_messages))
        .route("/webhooks/user_signup", post(webhook_user_signup))
        .route("/webhooks/user_deleted", post(webhook_user_deleted))
        .route("/webhooks/user_updated", post(webhook_user_updated))
        .route("/websocket/{room_id}", get(websocket_handler))
        .layer(cors)
        .layer(Extension(clerk))
        .with_state(app_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3050").await.unwrap();
    tracing::info!("listening on {}", listener.local_addr().unwrap());

    tracing::info!("you can see swagger here: http://localhost:3050/swagger-ui",);

    axum::serve(listener, app).await.unwrap();
}

#[derive(OpenApi)]
#[openapi(
    paths(
        api::user::get_user,
        api::user::get_user_me,
        api::user::get_user_rooms,
        api::room::create_room,
        api::room::get_room,
        api::room::delete_room,
        api::room::update_room,
        api::room::get_room_users,
        api::room::add_user_to_room,
        api::room::delete_user_from_room,
        api::message::get_room_messages,
        webhook::webhook_user_signup,
        webhook::webhook_user_deleted,
        webhook::webhook_user_updated,
    ),
    components(schemas(
        models::User,
        models::Room,
    )),
    tags((name = "User")),
    tags((name = "Room"))
)]
struct ApiDoc;
