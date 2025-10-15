use axum::{
    extract::{Path, State},
    http::StatusCode,
    response::Json,
    routing::{get, post},
    Router,
};
use serde::{Deserialize, Serialize};
use std::sync::Arc;

use crate::streaming::{AppState, StreamState};

#[derive(Debug, Serialize, Deserialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub uptime_seconds: u64,
    pub active_streams: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StatsResponse {
    pub active_streams: Vec<String>,
    pub total_streams: usize,
    pub memory_pool_stats: MemoryPoolStats,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MemoryPoolStats {
    pub total_buffers: usize,
    pub available_buffers: usize,
    pub buffer_size: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamAuthRequest {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamAuthResponse {
    pub code: i32,
    pub data: AuthData,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AuthData {
    pub forward: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct StreamEndRequest {
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ForwardingResponse {
    pub destinations: Vec<crate::streaming::Destination>,
}

pub fn create_server(app_state: Arc<AppState>) -> Router {
    Router::new()
        .route("/health", get(health_check))
        .route("/stats", get(get_stats))
        .route("/api/auth/stream", post(handle_stream_auth))
        .route("/api/auth/stream-end", post(handle_stream_end))
        .route(
            "/api/streams/forwarding/:stream_key",
            get(get_forwarding_config),
        )
        .with_state(app_state)
        .layer(
            tower_http::cors::CorsLayer::new()
                .allow_origin(tower_http::cors::Any)
                .allow_methods(tower_http::cors::Any)
                .allow_headers(tower_http::cors::Any),
        )
        .layer(tower_http::trace::TraceLayer::new_for_http())
}

async fn health_check(State(state): State<Arc<AppState>>) -> Json<HealthResponse> {
    let active_streams = state.active_streams.len();

    Json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        uptime_seconds: 0, // TODO: Track actual uptime
        active_streams,
    })
}

async fn get_stats(State(state): State<Arc<AppState>>) -> Json<StatsResponse> {
    let active_streams = state.get_all_streams();
    let total_streams = active_streams.len();

    Json(StatsResponse {
        active_streams,
        total_streams,
        memory_pool_stats: MemoryPoolStats {
            total_buffers: 100, // TODO: Get actual stats from memory pool
            available_buffers: 95,
            buffer_size: state.config.streaming.buffer_size_kb * 1024,
        },
    })
}

async fn handle_stream_auth(
    State(state): State<Arc<AppState>>,
    Json(request): Json<StreamAuthRequest>,
) -> Result<Json<StreamAuthResponse>, StatusCode> {
    tracing::info!("Stream auth request for: {}", request.name);

    // For now, accept all streams - in real implementation, call control plane
    let destinations = match state
        .authenticate_stream(&request.name, "rust-server-connection")
        .await
    {
        Ok(dests) => dests,
        Err(e) => {
            tracing::error!("Stream authentication failed: {}", e);
            return Err(StatusCode::UNAUTHORIZED);
        }
    };

    // Create stream context
    let stream_context = state.create_stream_context(
        request.name.clone(),
        "rust-server-connection".to_string(),
        destinations,
    );

    // Update status to active
    stream_context
        .update_status(StreamState::Active, None)
        .await;

    Ok(Json(StreamAuthResponse {
        code: 0,
        data: AuthData { forward: true },
    }))
}

async fn handle_stream_end(
    State(state): State<Arc<AppState>>,
    Json(request): Json<StreamEndRequest>,
) -> Result<StatusCode, StatusCode> {
    tracing::info!("Stream end request for: {}", request.name);

    if let Err(e) = state.notify_stream_end(&request.name).await {
        tracing::error!("Failed to notify stream end: {}", e);
        return Err(StatusCode::INTERNAL_SERVER_ERROR);
    }

    Ok(StatusCode::OK)
}

async fn get_forwarding_config(
    State(state): State<Arc<AppState>>,
    Path(stream_key): Path<String>,
) -> Result<Json<ForwardingResponse>, StatusCode> {
    tracing::info!("Forwarding config request for: {}", stream_key);

    // Get stream context
    if let Some(stream_info) = state.get_stream_info(&stream_key) {
        Ok(Json(ForwardingResponse {
            destinations: stream_info.destinations,
        }))
    } else {
        // Return empty destinations if stream not found
        Ok(Json(ForwardingResponse {
            destinations: vec![],
        }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::body::Body;
    use axum::http::StatusCode;
    use tower::ServiceExt;

    #[tokio::test]
    async fn test_health_check() {
        let config = crate::config::AppConfig::default();
        let app_state = AppState::new(config).await.unwrap();

        let app = create_server(app_state);

        // Create a test request
        let request = axum::http::Request::builder()
            .uri("/health")
            .body(Body::empty())
            .unwrap();

        // Send the request
        let response = app.oneshot(request).await.unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_stream_auth() {
        let config = crate::config::AppConfig::default();
        let app_state = AppState::new(config).await.unwrap();

        let app = create_server(app_state);

        let auth_request = StreamAuthRequest {
            name: "test-stream-key".to_string(),
        };

        let request_body = serde_json::to_string(&auth_request).unwrap();

        let request = axum::http::Request::builder()
            .method("POST")
            .uri("/api/auth/stream")
            .header("Content-Type", "application/json")
            .body(Body::from(request_body))
            .unwrap();

        let response = app.oneshot(request).await.unwrap();

        assert_eq!(response.status(), StatusCode::OK);
    }
}
