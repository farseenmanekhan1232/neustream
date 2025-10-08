const fs = require('fs');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function generateNginxConfig() {
  try {
    // Get all active destinations
    const result = await pool.query(`
      SELECT d.platform, d.rtmp_url, d.stream_key, u.stream_key as user_stream_key
      FROM destinations d
      JOIN users u ON d.user_id = u.id
      WHERE d.is_active = true
    `);

    let nginxConfig = `# nginx-rtmp configuration for multi-destination streaming
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

rtmp_auto_push on;
rtmp_auto_push_reconnect 1s;

# RTMP application for stream relay
rtmp {
    server {
        listen 1935;
        chunk_size 4096;
        max_streams 10;
        ping 30s;
        ping_timeout 10s;

        application live {
            live on;
            record off;
            drop_idle_publisher 10s;

            # Authentication callback
            on_publish http://${process.env.CONTROL_PLANE_HOST || 'localhost'}:3000/api/auth/stream;
            on_publish_done http://${process.env.CONTROL_PLANE_HOST || 'localhost'}:3000/api/auth/stream-end;

            # Dynamic destinations based on user configuration
`;

    // Add push directives for each destination
    result.rows.forEach((destination, index) => {
      const fullUrl = `${destination.rtmp_url}/${destination.stream_key}`;
      nginxConfig += `            push ${fullUrl};
`;
    });

    nginxConfig += `        }
    }
}

# HTTP server for stats and health checks
http {
    server {
        listen 80;
        location /stat {
            rtmp_stat all;
            rtmp_stat_stylesheet stat.xsl;
        }

        location /stat.xsl {
            root /usr/share/nginx/html;
        }

        location /health {
            return 200 'ok';
            add_header Content-Type text/plain;
        }
    }
}`;

    // Write the config file
    fs.writeFileSync('/tmp/nginx-rtmp-generated.conf', nginxConfig);
    console.log('✅ Generated nginx config with', result.rows.length, 'destinations');

    return nginxConfig;
  } catch (error) {
    console.error('Error generating nginx config:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run if called directly
if (require.main === module) {
  generateNginxConfig();
}

module.exports = { generateNginxConfig };