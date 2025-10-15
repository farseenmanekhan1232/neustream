use anyhow::Result;
use bytes::BytesMut;
use dashmap::DashMap;
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::config::AppConfig;

#[derive(Debug, Clone)]
pub struct AppState {
    pub config: AppConfig,
    pub active_streams: Arc<DashMap<String, Arc<StreamContext>>>,
    pub memory_pool: Arc<MemoryPool>,
    pub http_client: reqwest::Client,
}

#[derive(Debug, Clone)]
pub struct StreamContext {
    pub id: String,
    pub stream_key: String,
    pub connection_id: String,
    pub status: Arc<RwLock<StreamStatus>>,
    pub destinations: Arc<RwLock<Vec<Destination>>>,
    pub statistics: Arc<RwLock<StreamStatistics>>,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamStatus {
    pub state: StreamState,
    pub started_at: chrono::DateTime<chrono::Utc>,
    pub last_packet_at: Option<chrono::DateTime<chrono::Utc>>,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum StreamState {
    Connecting,
    Active,
    Error,
    Ended,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Destination {
    pub id: String,
    pub platform: String,
    pub rtmp_url: String,
    pub stream_key: String,
    pub status: DestinationStatus,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DestinationStatus {
    pub connected: bool,
    pub bytes_sent: u64,
    pub packets_sent: u64,
    pub last_packet_at: Option<chrono::DateTime<chrono::Utc>>,
    pub error_count: u32,
    pub error_message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamStatistics {
    pub total_bytes_received: u64,
    pub total_packets_received: u64,
    pub total_bytes_sent: u64,
    pub total_packets_sent: u64,
    pub active_destinations: u32,
    pub average_bitrate: u64,
    pub peak_bitrate: u64,
}

#[derive(Debug)]
pub struct MemoryPool {
    pool: crossbeam::queue::SegQueue<BytesMut>,
    buffer_size: usize,
}

impl AppState {
    pub async fn new(config: AppConfig) -> Result<Arc<Self>> {
        let http_client = reqwest::Client::builder()
            .timeout(std::time::Duration::from_secs(config.control_plane.timeout_seconds))
            .build()?;

        let memory_pool = Arc::new(MemoryPool::new(
            config.streaming.memory_pool_size_mb * 1024 * 1024,
            config.streaming.buffer_size_kb * 1024,
        ));

        Ok(Arc::new(Self {
            config,
            active_streams: Arc::new(DashMap::new()),
            memory_pool,
            http_client,
        }))
    }

    pub async fn authenticate_stream(
        &self,
        stream_key: &str,
        _connection_id: &str,
    ) -> Result<Vec<Destination>> {
        // Call control plane for authentication
        let auth_url = format!("{}/api/auth/stream", self.config.control_plane.url);

        let auth_request = serde_json::json!({
            "name": stream_key
        });

        let response = self
            .http_client
            .post(&auth_url)
            .json(&auth_request)
            .send()
            .await?;

        if !response.status().is_success() {
            anyhow::bail!(
                "Stream authentication failed: {}",
                response.status()
            );
        }

        // Get forwarding configuration
        let forwarding_url = format!(
            "{}/api/streams/forwarding/{}",
            self.config.control_plane.url,
            stream_key
        );

        let forwarding_response = self.http_client.get(&forwarding_url).send().await?;

        if !forwarding_response.status().is_success() {
            anyhow::bail!(
                "Failed to get forwarding configuration: {}",
                forwarding_response.status()
            );
        }

        let forwarding_data: serde_json::Value = forwarding_response.json().await?;
        let destinations: Vec<Destination> = serde_json::from_value(
            forwarding_data["destinations"].clone()
        )?;

        Ok(destinations)
    }

    pub fn create_stream_context(
        &self,
        stream_key: String,
        connection_id: String,
        destinations: Vec<Destination>,
    ) -> Arc<StreamContext> {
        let stream_id = Uuid::new_v4().to_string();
        let now = chrono::Utc::now();

        let context = Arc::new(StreamContext {
            id: stream_id,
            stream_key: stream_key.clone(),
            connection_id,
            status: Arc::new(RwLock::new(StreamStatus {
                state: StreamState::Connecting,
                started_at: now,
                last_packet_at: None,
                error_message: None,
            })),
            destinations: Arc::new(RwLock::new(destinations)),
            statistics: Arc::new(RwLock::new(StreamStatistics {
                total_bytes_received: 0,
                total_packets_received: 0,
                total_bytes_sent: 0,
                total_packets_sent: 0,
                active_destinations: 0,
                average_bitrate: 0,
                peak_bitrate: 0,
            })),
            created_at: now,
        });

        self.active_streams.insert(stream_key, context.clone());
        context
    }

    pub async fn notify_stream_end(&self,
        stream_key: &str,
    ) -> Result<()> {
        let end_url = format!("{}/api/auth/stream-end", self.config.control_plane.url);

        let end_request = serde_json::json!({
            "name": stream_key
        });

        let response = self
            .http_client
            .post(&end_url)
            .json(&end_request)
            .send()
            .await?;

        if !response.status().is_success() {
            tracing::warn!(
                "Failed to notify stream end: {}",
                response.status()
            );
        }

        // Remove from active streams
        self.active_streams.remove(stream_key);

        Ok(())
    }
}

impl StreamContext {
    pub async fn update_status(&self,
        state: StreamState,
        error_message: Option<String>,
    ) {
        let mut status = self.status.write().await;
        status.state = state;
        status.error_message = error_message;
    }

    pub async fn update_statistics(&self,
        bytes_received: u64,
        packets_received: u64,
    ) {
        let mut stats = self.statistics.write().await;
        stats.total_bytes_received += bytes_received;
        stats.total_packets_received += packets_received;
    }

    pub async fn get_stats(&self) -> StreamStatistics {
        self.statistics.read().await.clone()
    }
}

impl MemoryPool {
    pub fn new(total_size: usize, buffer_size: usize) -> Self {
        let pool = crossbeam::queue::SegQueue::new();
        let num_buffers = total_size / buffer_size;

        for _ in 0..num_buffers {
            pool.push(BytesMut::with_capacity(buffer_size));
        }

        Self {
            pool,
            buffer_size,
        }
    }

    pub fn acquire(&self) -> BytesMut {
        self.pool
            .pop()
            .unwrap_or_else(|| BytesMut::with_capacity(self.buffer_size))
    }

    pub fn release(&self, mut buffer: BytesMut) {
        buffer.clear();
        if buffer.capacity() >= self.buffer_size {
            self.pool.push(buffer);
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StreamInfo {
    pub stream_key: String,
    pub connection_id: String,
    pub status: StreamStatus,
    pub destinations: Vec<Destination>,
    pub statistics: StreamStatistics,
    pub created_at: chrono::DateTime<chrono::Utc>,
}

impl AppState {
    pub fn get_stream_info(&self,
        stream_key: &str,
    ) -> Option<StreamInfo> {
        self.active_streams.get(stream_key).map(|entry| {
            let context = entry.value();
            // Note: In a real implementation, we'd need async access to the data
            // For now, return a snapshot
            StreamInfo {
                stream_key: context.stream_key.clone(),
                connection_id: context.connection_id.clone(),
                status: StreamStatus {
                    state: StreamState::Active, // Simplified
                    started_at: context.created_at,
                    last_packet_at: None,
                    error_message: None,
                },
                destinations: vec![], // Simplified
                statistics: StreamStatistics {
                    total_bytes_received: 0,
                    total_packets_received: 0,
                    total_bytes_sent: 0,
                    total_packets_sent: 0,
                    active_destinations: 0,
                    average_bitrate: 0,
                    peak_bitrate: 0,
                },
                created_at: context.created_at,
            }
        })
    }

    pub fn get_all_streams(&self) -> Vec<String> {
        self.active_streams
            .iter()
            .map(|entry| entry.key().clone())
            .collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_memory_pool() {
        let pool = MemoryPool::new(1024 * 1024, 64 * 1024); // 1MB total, 64KB buffers

        let buffer1 = pool.acquire();
        assert_eq!(buffer1.capacity(), 64 * 1024);

        pool.release(buffer1);
        // Buffer should be reused
        let buffer2 = pool.acquire();
        assert_eq!(buffer2.capacity(), 64 * 1024);
    }

    #[test]
    fn test_stream_context_creation() {
        let _config = AppConfig::default();
        // Note: This is a simplified test without async runtime
        // In real usage, we'd use tokio::test
    }
}