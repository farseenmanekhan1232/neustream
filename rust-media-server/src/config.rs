use anyhow::Result;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub control_plane: ControlPlaneConfig,
    pub rtmp: RtmpConfig,
    pub http: HttpConfig,
    pub streaming: StreamingConfig,
    pub logging: LoggingConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ControlPlaneConfig {
    pub url: String,
    pub timeout_seconds: u64,
    pub retry_attempts: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RtmpConfig {
    pub port: u16,
    pub chunk_size: usize,
    pub gop_cache: bool,
    pub ping_interval_seconds: u64,
    pub ping_timeout_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpConfig {
    pub port: u16,
    pub allow_origin: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamingConfig {
    pub max_destinations_per_stream: usize,
    pub memory_pool_size_mb: usize,
    pub buffer_size_kb: usize,
    pub connection_timeout_seconds: u64,
    pub stats_update_interval_seconds: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoggingConfig {
    pub level: String,
    pub format: String,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            control_plane: ControlPlaneConfig {
                url: "https://api.neustream.app".to_string(),
                timeout_seconds: 10,
                retry_attempts: 3,
            },
            rtmp: RtmpConfig {
                port: 1935,
                chunk_size: 60000,
                gop_cache: true,
                ping_interval_seconds: 30,
                ping_timeout_seconds: 60,
            },
            http: HttpConfig {
                port: 8000,
                allow_origin: "*".to_string(),
            },
            streaming: StreamingConfig {
                max_destinations_per_stream: 10,
                memory_pool_size_mb: 64,
                buffer_size_kb: 64,
                connection_timeout_seconds: 30,
                stats_update_interval_seconds: 5,
            },
            logging: LoggingConfig {
                level: "info".to_string(),
                format: "json".to_string(),
            },
        }
    }
}

impl AppConfig {
    pub fn load<P: AsRef<Path>>(path: P) -> Result<Self> {
        let path = path.as_ref();

        if path.exists() {
            let contents = std::fs::read_to_string(path)?;
            let config: AppConfig = toml::from_str(&contents)?;
            Ok(config)
        } else {
            tracing::info!("Config file not found at {:?}, using defaults", path);
            Ok(Self::default())
        }
    }

    pub fn save<P: AsRef<Path>>(&self, path: P) -> Result<()> {
        let path = path.as_ref();
        let contents = toml::to_string_pretty(self)?;

        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        std::fs::write(path, contents)?;
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_config() {
        let config = AppConfig::default();
        assert_eq!(config.rtmp.port, 1935);
        assert_eq!(config.http.port, 8000);
        assert_eq!(config.streaming.max_destinations_per_stream, 10);
    }
}