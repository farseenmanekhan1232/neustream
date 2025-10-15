use anyhow::Result;
use clap::Parser;
use tracing::{info, warn};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod http;
mod rtmp;
mod streaming;

use config::AppConfig;

#[derive(Parser)]
#[command(name = "rust-media-server")]
#[command(about = "High-performance RTMP server with multi-destination forwarding")]
struct Cli {
    #[arg(short, long, env = "CONFIG_FILE", default_value = "config.toml")]
    config: String,

    #[arg(short, long, env = "CONTROL_PLANE_URL")]
    control_plane_url: Option<String>,

    #[arg(short, long, env = "RTMP_PORT", default_value = "1935")]
    rtmp_port: Option<u16>,

    #[arg(short, long, env = "HTTP_PORT", default_value = "8000")]
    http_port: Option<u16>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Initialize tracing
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "rust_media_server=debug,tower_http=debug".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    info!("🚀 Starting Rust Media Server");

    // Parse CLI arguments
    let cli = Cli::parse();

    // Load configuration
    let mut config = AppConfig::load(&cli.config)?;

    // Override with CLI arguments
    if let Some(url) = cli.control_plane_url {
        config.control_plane.url = url;
    }
    if let Some(port) = cli.rtmp_port {
        config.rtmp.port = port;
    }
    if let Some(port) = cli.http_port {
        config.http.port = port;
    }

    info!("Configuration loaded: {:?}", config);

    // Create shared state
    let app_state = streaming::AppState::new(config.clone()).await?;

    // Start RTMP server
    let rtmp_server = rtmp::RtmpServer::new(app_state.clone());
    let rtmp_handle = tokio::spawn(async move {
        if let Err(e) = rtmp_server.run().await {
            warn!("RTMP server error: {}", e);
        }
    });

    // Start HTTP server
    let http_server = http::create_server(app_state.clone());
    let http_handle = tokio::spawn(async move {
        let addr = format!("0.0.0.0:{}", config.http.port);
        info!("HTTP server listening on {}", addr);

        let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
        axum::serve(listener, http_server).await.unwrap();
    });

    // Wait for shutdown signal
    tokio::select! {
        _ = rtmp_handle => {
            info!("RTMP server stopped");
        }
        _ = http_handle => {
            info!("HTTP server stopped");
        }
        _ = tokio::signal::ctrl_c() => {
            info!("Shutdown signal received");
        }
    }

    info!("🛑 Rust Media Server shutting down gracefully");
    Ok(())
}
