# NeoStream Database Schema - Production Control Plane

**Generated:** 2025-11-15  
**Database:** PostgreSQL (neustream)  
**Host:** localhost:5432  
**Purpose:** Complete database schema documentation for reference

---

## Table of Contents
1. [Core User & Authentication Tables](#core-user--authentication-tables)
2. [Streaming & Sources Tables](#streaming--sources-tables)
3. [Payment & Subscription Tables](#payment--subscription-tables)
4. [Blog & Content Tables](#blog--content-tables)
5. [Chat & Communication Tables](#chat--communication-tables)
6. [Utility & Tracking Tables](#utility--tracking-tables)
7. [Admin & Settings Tables](#admin--settings-tables)

---

## Core User & Authentication Tables

### 1. users
**Primary user table with authentication and profile data**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | integer | NO | nextval('users_id_seq'::regclass) | Primary key |
| email | varchar(255) | NO | | User email (unique) |
| password_hash | varchar(255) | YES | | Hashed password |
| oauth_provider | varchar(50) | YES | | OAuth provider (google, twitch, etc.) |
| oauth_id | varchar(255) | YES | | OAuth provider ID |
| oauth_email | varchar(255) | YES | | OAuth email |
| display_name | varchar(255) | YES | | Display name |
| avatar_url | text | YES | | Profile avatar URL |
| stream_key | varchar(255) | NO | | Unique streaming key |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP | Creation timestamp |
| old_id | integer | YES | | Migration field |
| uuid | uuid | YES | uuid_generate_v4() | Unique UUID |
| totp_enabled | boolean | YES | false | TOTP enabled flag |
| totp_secret | varchar(255) | YES | | TOTP secret |
| totp_backup_codes | text | YES | | Backup codes |
| master_secret_encrypted | text | YES | | Encrypted master secret |
| totp_salt | varchar(255) | YES | | TOTP salt |
| email_verified | boolean | YES | false | Email verified flag |
| email_verification_token | varchar(255) | YES | | Email verification token |
| email_verification_expires | timestamptz | YES | | Verification expiry |
| password_reset_token | varchar(255) | YES | | Password reset token |
| password_reset_expires | timestamptz | YES | | Reset token expiry |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (email)
- UNIQUE (email_verification_token)
- UNIQUE (password_reset_token)
- UNIQUE (stream_key)
- UNIQUE (uuid)
- btree indexes on: email, email_verification_expires, email_verification_token, oauth_id, oauth_provider, password_reset_expires, password_reset_token, stream_key

**Referenced by:** 20+ tables

### 2. user_devices
**User device tracking for authentication**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('user_devices_id_seq'::regclass)
| user_id | integer | NO | |
| device_fingerprint | varchar(255) | YES | |
| device_name | varchar(100) | YES | |
| device_type | varchar(50) | YES | |
| browser | varchar(50) | YES | |
| os | varchar(50) | YES | |
| ip_address | inet | YES | |
| is_active | boolean | YES | true |
| last_used_at | timestamptz | YES | |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP |
| updated_at | timestamptz | YES | CURRENT_TIMESTAMP |
| uuid | uuid | YES | uuid_generate_v4() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)
- btree indexes on: user_id, device_fingerprint, last_used_at, device_type
- FOREIGN KEY: user_id → users(id)

### 3. totp_sessions
**TOTP authentication sessions**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('totp_sessions_id_seq'::regclass)
| user_id | integer | NO | |
| session_token | varchar(255) | YES | |
| ip_address | inet | YES | |
| user_agent | text | YES | |
| success | boolean | YES | false |
| attempts_count | integer | YES | 1 |
| locked_until | timestamptz | YES | |
| created_at | timestamptz | YES | now() |
| expires_at | timestamptz | YES | |
| uuid | uuid | YES | uuid_generate_v4() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)
- btree indexes on: user_id, expires_at
- FOREIGN KEY: user_id → users(id)

### 4. totp_usage_logs
**TOTP usage audit logs**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('totp_usage_logs_id_seq'::regclass)
| user_id | integer | NO | |
| action | varchar(50) | YES | |
| ip_address | inet | YES | |
| user_agent | text | YES | |
| success | boolean | YES | false |
| failure_reason | varchar(255) | YES | |
| created_at | timestamptz | YES | now() |

**Indexes:**
- PRIMARY KEY (id)
- btree indexes on: user_id, created_at, action
- FOREIGN KEY: user_id → users(id)

### 5. recovery_attempts
**Password recovery attempts tracking**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('recovery_attempts_id_seq'::regclass)
| user_id | integer | YES | |
| recovery_code_hash | varchar(255) | YES | |
| ip_address | inet | YES | |
| user_agent | text | YES | |
| success | boolean | YES | false |
| attempts_count | integer | YES | 1 |
| locked_until | timestamptz | YES | |
| created_at | timestamptz | YES | now() |

**Indexes:**
- PRIMARY KEY (id)
- btree indexes on: user_id
- FOREIGN KEY: user_id → users(id)

### 6. session_events
**User session tracking and analytics**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('session_events_id_seq'::regclass)
| user_id | integer | YES | |
| session_id | varchar(255) | YES | |
| event_type | varchar(50) | YES | |
| event_data | jsonb | YES | |
| ip_address | inet | YES | |
| user_agent | text | YES | |
| created_at | timestamptz | YES | now() |

**Indexes:**
- PRIMARY KEY (id)
- btree indexes on: user_id, session_id, event_type, created_at
- FOREIGN KEY: user_id → users(id)

---

## Streaming & Sources Tables

### 7. stream_sources
**Stream source configurations**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('stream_sources_id_seq'::regclass)
| platform | varchar(50) | YES | |
| source_type | varchar(50) | YES | |
| config | jsonb | YES | |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP |
| user_id | integer | NO | |
| uuid | uuid | YES | uuid_generate_v4() |
| user_uuid | uuid | YES | |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)
- btree indexes on: platform, is_active, user_id, user_uuid
- FOREIGN KEY: user_id → users(id), user_uuid → users(uuid)

### 8. destinations
**Streaming destination (RTMP) endpoints**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('destinations_id_seq'::regclass)
| platform | varchar(100) | NO | |
| rtmp_url | text | NO | |
| stream_key | varchar(255) | NO | |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP |
| user_id | integer | NO | |
| uuid | uuid | YES | uuid_generate_v4() |
| user_uuid | uuid | YES | |
| encrypted_stream_key | text | YES | |
| key_nonce | text | YES | |
| encryption_metadata | jsonb | YES | |
| stream_key_encrypted | jsonb | YES | |
| totp_secret_encrypted | text | YES | |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)
- btree indexes on: is_active, platform, user_id, user_uuid
- FOREIGN KEY: user_id → users(id), user_uuid → users(uuid)

### 9. active_streams
**Currently active streaming sessions**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('active_streams_id_seq'::regclass)
| stream_key | varchar(255) | NO | |
| started_at | timestamptz | YES | CURRENT_TIMESTAMP |
| ended_at | timestamptz | YES | |
| destinations_count | integer | YES | 0 |
| user_id | integer | YES | |
| source_id | integer | YES | |
| uuid | uuid | YES | uuid_generate_v4() |
| user_uuid | uuid | YES | |
| source_uuid | uuid | YES | |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)
- btree indexes on: ended_at, source_uuid, started_at, stream_key, user_uuid
- FOREIGN KEY: source_uuid → stream_sources(uuid), user_uuid → users(uuid)

### 10. source_destinations
**Junction table for stream sources to destinations**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('source_destinations_id_seq'::regclass)
| source_id | integer | NO | |
| destination_id | integer | NO | |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP |
| source_uuid | uuid | YES | |
| destination_uuid | uuid | YES | |

**Indexes:**
- PRIMARY KEY (id)
- btree indexes on: source_id, destination_id, source_uuid, destination_uuid, is_active
- FOREIGN KEY: source_uuid → stream_sources(uuid), destination_uuid → destinations(uuid)

### 11. streaming_sessions
**Historical streaming session data**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('streaming_sessions_id_seq'::regclass)
| user_id | integer | NO | |
| stream_key | varchar(255) | YES | |
| started_at | timestamptz | YES | CURRENT_TIMESTAMP |
| ended_at | timestamptz | YES | |
| duration_minutes | integer | YES | 0 |
| avg_viewers | numeric(10,2) | YES | 0 |
| max_viewers | integer | YES | 0 |
| total_bytes | bigint | YES | 0 |
| source_uuid | uuid | YES | |
| user_uuid | uuid | YES | |
| metadata | jsonb | YES | |

**Indexes:**
- PRIMARY KEY (id)
- btree indexes on: user_id, stream_key, started_at, ended_at, source_uuid, user_uuid
- FOREIGN KEY: user_id → users(id), user_uuid → users(uuid), source_uuid → stream_sources(uuid)

---

## Payment & Subscription Tables

### 12. subscription_plans
**Available subscription plans**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('subscription_plans_id_seq'::regclass)
| name | varchar(100) | NO | |
| description | text | YES | |
| price_monthly | numeric(10,2) | NO | |
| price_yearly | numeric(10,2) | YES | |
| currency | varchar(3) | YES | 'INR' |
| features | jsonb | YES | |
| limits | jsonb | YES | |
| is_active | boolean | YES | true |
| sort_order | integer | YES | 0 |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |
| uuid | uuid | YES | uuid_generate_v4() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)
- btree indexes on: is_active, sort_order, name

### 13. user_subscriptions
**User subscription records**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('user_subscriptions_id_seq'::regclass)
| user_id | integer | NO | |
| plan_id | integer | NO | |
| status | varchar(20) | YES | 'active' |
| current_period_start | timestamptz | YES | |
| current_period_end | timestamptz | YES | |
| cancel_at_period_end | boolean | YES | false |
| canceled_at | timestamptz | YES | |
| trial_start | timestamptz | YES | |
| trial_end | timestamptz | YES | |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |
| uuid | uuid | YES | uuid_generate_v4() |
| user_uuid | uuid | YES | |
| plan_uuid | uuid | YES | |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)
- btree indexes on: status, user_id, user_uuid, plan_uuid, current_period_end
- FOREIGN KEY: user_id → users(id), user_uuid → users(uuid), plan_id → subscription_plans(id), plan_uuid → subscription_plans(uuid)

### 14. payment_orders
**Payment order records**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('payment_orders_id_seq'::regclass)
| order_id | varchar(255) | NO | |
| plan_id | integer | YES | |
| billing_cycle | varchar(10) | YES | 'monthly' |
| amount | numeric(10,2) | NO | |
| currency | varchar(3) | YES | 'INR' |
| payment_id | varchar(255) | YES | |
| status | varchar(20) | YES | 'created' |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |
| user_id | integer | NO | 1 |
| uuid | uuid | YES | uuid_generate_v4() |
| user_uuid | uuid | YES | |
| plan_uuid | uuid | YES | |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (order_id)
- UNIQUE (uuid)
- btree indexes on: order_id, plan_uuid, status, user_uuid
- FOREIGN KEY: user_id → users(id), user_uuid → users(uuid), plan_id → subscription_plans(id), plan_uuid → subscription_plans(uuid)

### 15. payments
**Payment transaction records**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('payments_id_seq'::regclass)
| plan_id | integer | YES | |
| billing_cycle | varchar(10) | YES | 'monthly' |
| amount | numeric(10,2) | NO | |
| currency | varchar(3) | YES | 'INR' |
| payment_id | varchar(255) | YES | |
| order_id | varchar(255) | YES | |
| status | varchar(20) | YES | 'pending' |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |
| user_id | integer | NO | 1 |
| uuid | uuid | YES | uuid_generate_v4() |
| user_uuid | uuid | YES | |
| plan_uuid | uuid | YES | |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (payment_id)
- UNIQUE (uuid)
- btree indexes on: payment_id, plan_uuid, status, user_uuid
- FOREIGN KEY: user_id → users(id), user_uuid → users(uuid), plan_id → subscription_plans(id), plan_uuid → subscription_plans(uuid)

### 16. usage_tracking
**Usage tracking for billing and limits**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('usage_tracking_id_seq'::regclass)
| user_id | integer | NO | |
| period_start | timestamptz | YES | |
| period_end | timestamptz | YES | |
| streaming_hours | numeric(10,2) | YES | 0 |
| bandwidth_gb | numeric(10,2) | YES | 0 |
| storage_gb | numeric(10,2) | YES | 0 |
| api_calls | integer | YES | 0 |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |

**Indexes:**
- PRIMARY KEY (id)
- btree indexes on: user_id, period_start, period_end
- FOREIGN KEY: user_id → users(id)

### 17. plan_limits_tracking
**Current plan limits and usage**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| current_sources_count | integer | YES | 0 |
| current_destinations_count | integer | YES | 0 |
| current_month_streaming_hours | numeric(10,2) | YES | 0 |
| last_updated | timestamptz | YES | now() |
| user_id | integer | NO | 1 |
| uuid | uuid | YES | uuid_generate_v4() |
| current_chat_connectors_count | integer | YES | 0 |

**Indexes:**
- UNIQUE (uuid)
- FOREIGN KEY: user_id → users(id)

---

## Blog & Content Tables

### 18. blog_posts
**Blog post content**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| title | varchar(255) | NO | |
| slug | varchar(255) | NO | |
| excerpt | text | YES | |
| content | jsonb | NO | |
| content_html | text | YES | |
| featured_image | varchar(255) | YES | |
| author_id | integer | YES | |
| status | varchar(20) | YES | 'draft' |
| published_at | timestamptz | YES | |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |
| meta_title | varchar(255) | YES | |
| meta_description | text | YES | |
| meta_keywords | text | YES | |
| canonical_url | varchar(255) | YES | |
| schema_data | jsonb | YES | |
| view_count | integer | YES | 0 |
| read_time_minutes | integer | YES | |
| search_score | real | YES | 0.0 |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (slug)
- btree indexes on: author_id, published_at, slug, status
- CHECK: status ∈ ('draft', 'published', 'scheduled', 'archived')
- FOREIGN KEY: author_id → users(id)

### 19. blog_categories
**Blog post categories (hierarchical)**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| name | varchar(100) | NO | |
| slug | varchar(100) | NO | |
| description | text | YES | |
| color | varchar(7) | YES | '#6366f1' |
| icon | varchar(50) | YES | |
| parent_id | uuid | YES | |
| sort_order | integer | YES | 0 |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (slug)
- btree indexes on: slug
- FOREIGN KEY: parent_id → blog_categories(id)

### 20. blog_tags
**Blog post tags**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| name | varchar(50) | NO | |
| slug | varchar(50) | NO | |
| usage_count | integer | YES | 0 |
| created_at | timestamptz | YES | now() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (slug)
- btree indexes on: slug

### 21. blog_post_categories
**Junction table: posts to categories**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| post_id | uuid | NO | |
| category_id | uuid | NO | |

**Indexes:**
- PRIMARY KEY (post_id, category_id)
- FOREIGN KEY: post_id → blog_posts(id), category_id → blog_categories(id)

### 22. blog_post_tags
**Junction table: posts to tags**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| post_id | uuid | NO | |
| tag_id | uuid | NO | |

**Indexes:**
- PRIMARY KEY (post_id, tag_id)
- FOREIGN KEY: post_id → blog_posts(id), tag_id → blog_tags(id)

### 23. blog_analytics
**Blog post analytics tracking**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| post_id | uuid | YES | |
| date | date | NO | |
| views | integer | YES | 0 |
| unique_visitors | integer | YES | 0 |
| avg_time_on_page | integer | YES | 0 |
| bounce_rate | numeric(5,2) | YES | 0.00 |
| created_at | timestamptz | YES | now() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (post_id, date)
- btree indexes on: date, post_id
- FOREIGN KEY: post_id → blog_posts(id)

---

## Chat & Communication Tables

### 24. chat_connectors
**Third-party chat platform connectors**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('chat_connectors_id_seq'::regclass)
| source_id | integer | YES | |
| platform | varchar(50) | NO | |
| connector_type | varchar(50) | NO | |
| config | jsonb | NO | |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |
| user_id | integer | YES | |
| uuid | uuid | YES | uuid_generate_v4() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)
- Triggers: update_plan_limits_on_chat_connector (AFTER INSERT OR DELETE)

### 25. chat_messages
**Chat messages from connected platforms**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('chat_messages_id_seq'::regclass)
| connector_id | integer | YES | |
| platform_message_id | varchar(255) | YES | |
| author_name | varchar(255) | NO | |
| author_id | varchar(255) | YES | |
| message_text | text | NO | |
| message_type | varchar(50) | YES | |
| metadata | jsonb | YES | |
| created_at | timestamptz | YES | now() |
| source_id | integer | YES | |
| uuid | uuid | YES | uuid_generate_v4() |
| connector_uuid | uuid | YES | |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)
- btree indexes on: connector_uuid
- FOREIGN KEY: connector_id → chat_connectors(id), connector_uuid → chat_connectors(uuid)

### 26. chat_sessions
**Chat session management**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('chat_sessions_id_seq'::regclass)
| session_key | varchar(255) | NO | |
| is_active | boolean | YES | true |
| created_at | timestamptz | YES | now() |
| source_id | integer | NO | |
| uuid | uuid | YES | uuid_generate_v4() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (session_key)
- UNIQUE (uuid)

---

## Utility & Tracking Tables

### 27. contact_submissions
**Contact form submissions**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| name | varchar(255) | NO | |
| email | varchar(255) | NO | |
| subject | varchar(255) | NO | |
| message | text | NO | |
| status | varchar(20) | YES | 'pending' |
| priority | varchar(10) | YES | 'normal' |
| user_id | integer | YES | |
| ip_address | inet | YES | |
| user_agent | text | YES | |
| created_at | timestamptz | YES | now() |
| updated_at | timestamptz | YES | now() |
| responded_at | timestamptz | YES | |
| responded_by | integer | YES | |
| notes | text | YES | |

**Indexes:**
- PRIMARY KEY (id)
- btree indexes on: created_at, email, priority, status, user_id
- FOREIGN KEY: user_id → users(id), responded_by → users(id)
- Triggers: update_contact_submissions_updated_at_trigger (BEFORE UPDATE)

### 28. contact_submission_responses
**Responses to contact submissions**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | NO | uuid_generate_v4() |
| submission_id | uuid | YES | |
| user_id | integer | YES | |
| response | text | NO | |
| response_type | varchar(20) | YES | 'email' |
| created_at | timestamptz | YES | now() |

**Indexes:**
- PRIMARY KEY (id)
- btree indexes on: submission_id
- FOREIGN KEY: submission_id → contact_submissions(id), user_id → users(id)

### 29. currency_rates
**Currency exchange rates (cached)**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| from_currency | varchar(3) | NO | |
| to_currency | varchar(3) | NO | |
| rate | numeric(10,6) | YES | |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP |
| expires_at | timestamptz | YES | (CURRENT_TIMESTAMP + '01:00:00'::interval)

**Indexes:**
- PRIMARY KEY (from_currency, to_currency)
- btree indexes on: expires_at

### 30. ip_location_cache
**IP geolocation cache**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| ip_address | inet | NO | |
| country_code | varchar(2) | YES | |
| currency | varchar(3) | YES | |
| is_india | boolean | YES | |
| created_at | timestamptz | YES | CURRENT_TIMESTAMP |
| expires_at | timestamptz | YES | (CURRENT_TIMESTAMP + '24:00:00'::interval)

**Indexes:**
- PRIMARY KEY (ip_address)
- btree indexes on: expires_at

### 31. migrations
**Database migration tracking**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('migrations_id_seq'::regclass)
| name | varchar(255) | NO | |
| executed_at | timestamptz | YES | now() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (name)

---

## Admin & Settings Tables

### 32. admin_settings
**System-wide admin settings**

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | integer | NO | nextval('admin_settings_id_seq'::regclass)
| currency_preference | varchar(3) | YES | 'AUTO' |
| auto_detect_currency | boolean | YES | true |
| created_at | timestamp | YES | CURRENT_TIMESTAMP |
| updated_at | timestamp | YES | CURRENT_TIMESTAMP |
| user_id | integer | NO | 1 |
| uuid | uuid | YES | uuid_generate_v4() |

**Indexes:**
- PRIMARY KEY (id)
- UNIQUE (uuid)

---

## Database Statistics

**Total Tables:** 32  
**Primary Schemas:** public, postgres  
**Key Features:**
- UUID primary keys for most tables
- Dual key system (integer id + uuid)
- Comprehensive audit logging
- Foreign key relationships with CASCADE/SET NULL
- JSONB for flexible config and metadata storage
- Timestamptz for timezone-aware timestamps
- Indexed foreign keys for performance
- Triggers for automatic updates

**Common Patterns:**
1. Most tables use both integer ID (for migrations) and UUID (for external references)
2. All user-related tables track both user_id and user_uuid
3. Timestamps use timestamptz for consistency
4. JSONB fields for flexible configuration data
5. Comprehensive indexing on foreign keys and frequently queried columns

