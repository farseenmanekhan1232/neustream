# Build stage
FROM rust:1.75 as builder

WORKDIR /app

# Copy manifests
COPY Cargo.toml Cargo.lock ./

# Copy source code
COPY src ./src

# Build the application
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install necessary runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libssl3 \
    && rm -rf /var/lib/apt/lists/*

# Create user
RUN useradd -m -u 1000 -s /bin/bash neustream

# Copy binary from builder
COPY --from=builder /app/target/release/rust-media-server /usr/local/bin/rust-media-server

# Copy configuration
COPY config.toml /etc/neustream/config.toml

# Create data directory
RUN mkdir -p /var/lib/neustream && chown neustream:neustream /var/lib/neustream

# Switch to non-root user
USER neustream

# Expose ports
EXPOSE 1935 8000

# Set entrypoint
ENTRYPOINT ["/usr/local/bin/rust-media-server"]
CMD ["--config", "/etc/neustream/config.toml"]