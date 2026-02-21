# Boptone Agent API Specification v1.0

**Document Version:** 1.0.0  
**Last Updated:** February 21, 2026  
**Author:** Manus AI  
**Status:** Design Specification

---

## Overview

The Boptone Agent API enables third-party AI agents to programmatically discover, recommend, and transact with Boptone on behalf of users. This specification defines the technical contract for agent integration, including authentication, endpoints, request/response formats, rate limiting, and error handling.

**Base URL:** `https://api.boptone.com/v1/agents`

**Protocol:** HTTPS only  
**Content Type:** `application/json`  
**Authentication:** OAuth 2.0 with agent-specific scopes

---

## Authentication

### OAuth 2.0 Flow

Boptone Agent API uses OAuth 2.0 authorization code flow with PKCE (Proof Key for Code Exchange) for secure agent authentication.

**Step 1: Agent Registration**

Agents register at `https://developers.boptone.com` and receive:
- `client_id`: Unique identifier for the agent
- `client_secret`: Secret key for token exchange (confidential clients only)

**Step 2: Authorization Request**

Agent redirects user to Boptone authorization endpoint:

```
GET https://auth.boptone.com/oauth/authorize?
  response_type=code&
  client_id={client_id}&
  redirect_uri={redirect_uri}&
  scope={requested_scopes}&
  state={random_state}&
  code_challenge={code_challenge}&
  code_challenge_method=S256
```

**Parameters:**
- `response_type`: Must be `code`
- `client_id`: Agent's client ID
- `redirect_uri`: URI to redirect after authorization (must match registered URI)
- `scope`: Space-separated list of requested scopes (see Scopes section)
- `state`: Random string for CSRF protection
- `code_challenge`: Base64-URL-encoded SHA256 hash of code_verifier
- `code_challenge_method`: Must be `S256`

**Step 3: User Authorization**

User reviews requested scopes and approves/denies access. On approval, Boptone redirects to:

```
{redirect_uri}?code={authorization_code}&state={state}
```

**Step 4: Token Exchange**

Agent exchanges authorization code for access token:

```http
POST https://auth.boptone.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code={authorization_code}&
redirect_uri={redirect_uri}&
client_id={client_id}&
client_secret={client_secret}&
code_verifier={code_verifier}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "def50200a1b2c3d4e5f6...",
  "scope": "agent:search agent:purchase"
}
```

**Step 5: Token Refresh**

Access tokens expire after 1 hour. Use refresh token to obtain new access token:

```http
POST https://auth.boptone.com/oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token&
refresh_token={refresh_token}&
client_id={client_id}&
client_secret={client_secret}
```

### Scopes

Agents request specific scopes based on required functionality:

| Scope | Description | User Consent Required |
|-------|-------------|----------------------|
| `agent:search` | Read-only access to artist/product catalog | No |
| `agent:purchase` | Initiate transactions on behalf of user | Yes |
| `agent:stream` | Access streaming endpoints | Yes |
| `agent:analytics` | Access aggregated platform data | No |
| `agent:profile` | Read user profile information | Yes |

**Scope Combinations:**
- Discovery agents: `agent:search agent:analytics`
- Shopping agents: `agent:search agent:purchase agent:profile`
- Streaming agents: `agent:search agent:stream agent:profile`
- Full access: `agent:search agent:purchase agent:stream agent:analytics agent:profile`

### API Key Authentication (Deprecated)

For backward compatibility, agents may use API key authentication for read-only endpoints (`/search`, `/analytics`). This method is deprecated and will be removed in v2.0.

```http
GET /v1/agents/search
Authorization: Bearer {api_key}
```

---

## Endpoints

### 1. Search Artists and Products

**Endpoint:** `GET /v1/agents/search`

**Description:** Discover artists and products using natural language queries or structured filters.

**Authentication:** Requires `agent:search` scope

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | No | Natural language search query (e.g., "Find me 5 jazz artists with vinyl under $30") |
| `filters` | object | No | Structured filters (see Filters Object) |
| `limit` | integer | No | Maximum number of results (default: 10, max: 100) |
| `offset` | integer | No | Pagination offset (default: 0) |
| `sort` | string | No | Sort order: `relevance`, `price_asc`, `price_desc`, `newest`, `popular` (default: `relevance`) |

**Filters Object:**

```json
{
  "genre": ["jazz", "indie_rock"],
  "product_type": "vinyl",
  "price_min": 10,
  "price_max": 50,
  "in_stock": true,
  "artist_location": "US",
  "release_date_after": "2024-01-01"
}
```

**Example Request:**

```http
GET /v1/agents/search?query=Find%20me%205%20jazz%20artists%20with%20vinyl%20under%20$30&limit=5
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "results": [
    {
      "artist_id": "artist_123",
      "artist_name": "Miles Ahead Collective",
      "artist_url": "https://boptone.com/@milesahead",
      "artist_bio": "Contemporary jazz ensemble blending traditional and modern sounds...",
      "genre": ["jazz", "fusion"],
      "location": "New York, NY",
      "followers": 1250,
      "products": [
        {
          "product_id": "prod_456",
          "name": "Blue Notes Vol. 1",
          "price": 24.99,
          "currency": "USD",
          "format": "vinyl",
          "variant": "12-inch LP",
          "in_stock": true,
          "stock_quantity": 15,
          "product_url": "https://boptone.com/shop/product/blue-notes-vol-1",
          "image_url": "https://cdn.boptone.com/products/blue-notes-vol-1.jpg",
          "release_date": "2025-11-15"
        }
      ]
    }
  ],
  "total_results": 5,
  "query_id": "query_789",
  "pagination": {
    "limit": 5,
    "offset": 0,
    "has_more": false
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid query or filters
- `401 Unauthorized`: Missing or invalid access token
- `429 Too Many Requests`: Rate limit exceeded

---

### 2. Purchase Product

**Endpoint:** `POST /v1/agents/purchase`

**Description:** Initiate a transaction on behalf of an authenticated user.

**Authentication:** Requires `agent:purchase` scope

**Request Body:**

```json
{
  "user_token": "user_oauth_token",
  "product_id": "prod_456",
  "quantity": 1,
  "shipping_address": {
    "name": "John Doe",
    "street": "123 Main St",
    "city": "Los Angeles",
    "state": "CA",
    "zip": "90001",
    "country": "US"
  },
  "payment_method": "stripe_pm_abc123",
  "shipping_method": "usps_priority"
}
```

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_token` | string | Yes | User's OAuth access token |
| `product_id` | string | Yes | Product ID to purchase |
| `quantity` | integer | Yes | Quantity to purchase (min: 1, max: 10) |
| `shipping_address` | object | Yes | Shipping address (see Shipping Address Object) |
| `payment_method` | string | Yes | Stripe payment method ID |
| `shipping_method` | string | No | Shipping method (default: cheapest available) |

**Shipping Address Object:**

```json
{
  "name": "John Doe",
  "street": "123 Main St",
  "street2": "Apt 4B",
  "city": "Los Angeles",
  "state": "CA",
  "zip": "90001",
  "country": "US",
  "phone": "+1-555-123-4567"
}
```

**Response:**

```json
{
  "order_id": "order_789",
  "status": "confirmed",
  "subtotal": 24.99,
  "shipping_cost": 5.00,
  "tax": 2.50,
  "total": 32.49,
  "currency": "USD",
  "shipping_label_url": "https://shippo.com/label/xyz",
  "tracking_number": "1Z999AA10123456784",
  "estimated_delivery": "2026-03-01",
  "order_url": "https://boptone.com/orders/order_789"
}
```

**Error Responses:**

- `400 Bad Request`: Invalid request body or parameters
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient permissions (missing `agent:purchase` scope)
- `404 Not Found`: Product not found or out of stock
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Payment processing failed

---

### 3. Stream Track

**Endpoint:** `GET /v1/agents/stream`

**Description:** Obtain authenticated streaming URL for a track.

**Authentication:** Requires `agent:stream` scope

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `track_id` | string | Yes | Track ID to stream |
| `quality` | string | No | Audio quality: `low` (128kbps), `medium` (256kbps), `high` (320kbps) (default: `medium`) |
| `format` | string | No | Audio format: `mp3`, `aac`, `flac` (default: `mp3`) |

**Example Request:**

```http
GET /v1/agents/stream?track_id=track_123&quality=high&format=mp3
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "stream_url": "https://cdn.boptone.com/stream/track_123.m3u8?token=xyz",
  "duration_seconds": 245,
  "bitrate_kbps": 320,
  "format": "mp3",
  "license_type": "bap_protocol",
  "artist_payout_per_stream": 0.05,
  "expires_at": "2026-02-21T03:00:00Z"
}
```

**Error Responses:**

- `400 Bad Request`: Invalid track_id or parameters
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient permissions (missing `agent:stream` scope)
- `404 Not Found`: Track not found
- `429 Too Many Requests`: Rate limit exceeded

---

### 4. Analytics

**Endpoint:** `GET /v1/agents/analytics`

**Description:** Access aggregated platform data for recommendations and trend analysis.

**Authentication:** Requires `agent:analytics` scope

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `metrics` | array | Yes | List of metrics to retrieve (see Metrics) |
| `time_range` | string | No | Time range: `24h`, `7d`, `30d`, `90d`, `1y` (default: `7d`) |
| `genre` | string | No | Filter by genre |
| `limit` | integer | No | Maximum number of results per metric (default: 10, max: 100) |

**Available Metrics:**

- `trending_artists`: Artists with highest growth rate
- `top_genres`: Most popular genres by stream count
- `new_releases`: Recently released products
- `top_products`: Best-selling products
- `rising_stars`: Artists with rapid follower growth

**Example Request:**

```http
GET /v1/agents/analytics?metrics=trending_artists,top_genres&time_range=7d&limit=5
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "time_range": "7d",
  "generated_at": "2026-02-21T02:30:00Z",
  "metrics": {
    "trending_artists": [
      {
        "artist_id": "artist_123",
        "artist_name": "Miles Ahead Collective",
        "artist_url": "https://boptone.com/@milesahead",
        "growth_rate": 0.45,
        "stream_count": 12500,
        "follower_count": 1250
      }
    ],
    "top_genres": [
      {
        "genre": "jazz",
        "stream_count": 450000,
        "artist_count": 320
      },
      {
        "genre": "indie_rock",
        "stream_count": 380000,
        "artist_count": 510
      }
    ]
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid metrics or parameters
- `401 Unauthorized`: Missing or invalid access token
- `429 Too Many Requests`: Rate limit exceeded

---

### 5. User Profile

**Endpoint:** `GET /v1/agents/profile`

**Description:** Retrieve user profile information for personalization.

**Authentication:** Requires `agent:profile` scope

**Request Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `user_token` | string | Yes | User's OAuth access token |
| `fields` | array | No | Specific fields to retrieve (default: all) |

**Available Fields:**

- `basic`: Name, email, profile picture
- `preferences`: Music taste, favorite genres
- `listening_history`: Recent streams (last 30 days)
- `purchase_history`: Recent purchases (last 90 days)
- `following`: Artists user follows

**Example Request:**

```http
GET /v1/agents/profile?fields=basic,preferences
Authorization: Bearer {access_token}
```

**Response:**

```json
{
  "user_id": "user_456",
  "basic": {
    "name": "John Doe",
    "email": "john@example.com",
    "profile_picture": "https://cdn.boptone.com/users/user_456.jpg"
  },
  "preferences": {
    "favorite_genres": ["jazz", "indie_rock", "electronic"],
    "discovery_mode": "adventurous",
    "auto_purchase_enabled": true,
    "monthly_budget": 50.00
  }
}
```

**Error Responses:**

- `400 Bad Request`: Invalid user_token or fields
- `401 Unauthorized`: Missing or invalid access token
- `403 Forbidden`: Insufficient permissions (missing `agent:profile` scope)
- `429 Too Many Requests`: Rate limit exceeded

---

## Rate Limiting

Rate limits are enforced per agent (client_id) using token bucket algorithm.

### Rate Limit Tiers

| Endpoint | Requests/Hour | Burst Limit |
|----------|---------------|-------------|
| `/search` | 1000 | 100/minute |
| `/purchase` | 100 | 10/minute |
| `/stream` | 10,000 | 1000/minute |
| `/analytics` | 500 | 50/minute |
| `/profile` | 500 | 50/minute |

### Rate Limit Headers

All responses include rate limit information in headers:

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1708567200
```

### Rate Limit Exceeded

When rate limit is exceeded, API returns HTTP 429 with Retry-After header:

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 3600
Content-Type: application/json

{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Rate limit exceeded. Please retry after 3600 seconds.",
    "details": {
      "limit": 1000,
      "reset_at": "2026-02-21T04:00:00Z"
    }
  }
}
```

### Rate Limit Increase Requests

Agents requiring higher rate limits can request increases at `developers.boptone.com/rate-limits`. Requests are reviewed within 5 business days.

---

## Error Handling

All errors return JSON with standardized format:

```json
{
  "error": {
    "code": "error_code",
    "message": "Human-readable error message",
    "details": {
      "additional_context": "value"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `invalid_request` | 400 | Malformed request (missing parameters, invalid JSON) |
| `unauthorized` | 401 | Missing or invalid authentication |
| `forbidden` | 403 | Insufficient permissions |
| `not_found` | 404 | Resource does not exist |
| `rate_limit_exceeded` | 429 | Too many requests |
| `internal_error` | 500 | Server error |
| `service_unavailable` | 503 | Temporary service disruption |

### Error Handling Best Practices

**Retry Logic:**
- Implement exponential backoff for 5xx errors
- Respect Retry-After header for 429 errors
- Do not retry 4xx errors (except 429)

**Error Logging:**
- Log all errors with request_id for debugging
- Monitor error rates and alert on spikes
- Include error context in logs (endpoint, parameters, user_id)

**User Communication:**
- Translate technical errors into user-friendly messages
- Provide actionable next steps (e.g., "Please try again later")
- Avoid exposing internal error details to end users

---

## Versioning

API versioning follows semantic versioning (MAJOR.MINOR.PATCH):

- **MAJOR**: Breaking changes (require agent updates)
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

**Current Version:** v1.0.0

**Version Lifecycle:**
- **Active**: Current version, fully supported
- **Deprecated**: Previous version, supported for 12 months
- **Sunset**: End of life, no longer supported

**Version Header:**

All requests include API version in URL:

```http
GET /v1/agents/search
```

**Deprecation Notice:**

When a version is deprecated, responses include deprecation header:

```http
X-API-Deprecation: version=v1, sunset=2027-02-21
```

---

## Webhooks

Agents can register webhooks to receive real-time notifications for events.

### Webhook Registration

Register webhooks at `https://developers.boptone.com/webhooks`

**Webhook Configuration:**
- **URL**: HTTPS endpoint to receive events
- **Events**: List of events to subscribe to
- **Secret**: Shared secret for signature verification

### Webhook Events

| Event | Description |
|-------|-------------|
| `order.created` | New order placed |
| `order.shipped` | Order shipped with tracking number |
| `order.delivered` | Order delivered to customer |
| `stream.started` | User started streaming a track |
| `artist.new_release` | Artist published new product |

### Webhook Payload

```json
{
  "event": "order.created",
  "timestamp": "2026-02-21T02:30:00Z",
  "data": {
    "order_id": "order_789",
    "user_id": "user_456",
    "product_id": "prod_456",
    "total": 32.49
  }
}
```

### Webhook Signature Verification

All webhook requests include signature header:

```http
X-Webhook-Signature: sha256=abc123def456...
```

Verify signature using HMAC-SHA256:

```python
import hmac
import hashlib

def verify_webhook(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode(),
        payload.encode(),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(f"sha256={expected_signature}", signature)
```

---

## Code Examples

### Python Example

```python
import requests

# Authentication
def get_access_token(client_id, client_secret, authorization_code):
    response = requests.post(
        "https://auth.boptone.com/oauth/token",
        data={
            "grant_type": "authorization_code",
            "code": authorization_code,
            "client_id": client_id,
            "client_secret": client_secret,
        }
    )
    return response.json()["access_token"]

# Search artists
def search_artists(access_token, query):
    response = requests.get(
        "https://api.boptone.com/v1/agents/search",
        headers={"Authorization": f"Bearer {access_token}"},
        params={"query": query, "limit": 5}
    )
    return response.json()

# Purchase product
def purchase_product(access_token, product_id, shipping_address):
    response = requests.post(
        "https://api.boptone.com/v1/agents/purchase",
        headers={"Authorization": f"Bearer {access_token}"},
        json={
            "product_id": product_id,
            "quantity": 1,
            "shipping_address": shipping_address,
            "payment_method": "stripe_pm_abc123"
        }
    )
    return response.json()
```

### JavaScript Example

```javascript
// Authentication
async function getAccessToken(clientId, clientSecret, authorizationCode) {
  const response = await fetch("https://auth.boptone.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: authorizationCode,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });
  const data = await response.json();
  return data.access_token;
}

// Search artists
async function searchArtists(accessToken, query) {
  const response = await fetch(
    `https://api.boptone.com/v1/agents/search?query=${encodeURIComponent(query)}&limit=5`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.json();
}

// Purchase product
async function purchaseProduct(accessToken, productId, shippingAddress) {
  const response = await fetch("https://api.boptone.com/v1/agents/purchase", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: productId,
      quantity: 1,
      shipping_address: shippingAddress,
      payment_method: "stripe_pm_abc123",
    }),
  });
  return response.json();
}
```

---

## Testing

### Sandbox Environment

Test Agent API in sandbox environment before production deployment.

**Sandbox Base URL:** `https://sandbox-api.boptone.com/v1/agents`

**Sandbox Features:**
- Test data (artists, products, users)
- No real transactions or charges
- Unlimited rate limits
- Detailed error messages

**Sandbox Credentials:**

Register sandbox agent at `https://developers.boptone.com/sandbox`

### Test Cards

Use test payment methods for sandbox purchases:

| Card Number | Description |
|-------------|-------------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Card declined |
| `4000 0000 0000 9995` | Insufficient funds |

### Test Users

Sandbox includes pre-configured test users:

| Email | Password | Description |
|-------|----------|-------------|
| `test@boptone.com` | `password123` | Standard user |
| `premium@boptone.com` | `password123` | Premium subscriber |

---

## Support

### Developer Portal

Access documentation, code examples, and API explorer at `https://developers.boptone.com`

### Support Channels

- **Email:** developers@boptone.com
- **Discord:** https://discord.gg/boptone-dev
- **GitHub:** https://github.com/boptone/agent-api-examples

### SLA

- **Uptime:** 99.9% monthly uptime guarantee
- **Response Time:** <200ms p95 latency
- **Support Response:** <24 hours for email inquiries

---

**End of Specification**
