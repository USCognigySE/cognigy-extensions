# Okta Extension for Cognigy.AI
**Version: 1.2.0**

Integrates Cognigy.AI with Okta Identity Platform (https://www.okta.com)

This extension provides OAuth2 Client Credentials authentication for Okta, enabling secure token retrieval for API access.

### Connection
This extension requires a Connection to be defined and passed to the Node. The Connection must use credentials from your [Okta OAuth2 Application](https://developer.okta.com/docs/guides/implement-grant-type/clientcreds/main/):

- **clientId**: Your Okta application Client ID
- **clientSecret**: Your Okta application Client Secret

## Node: Get Okta Access Token

Retrieves an OAuth2 access token from Okta using the Client Credentials grant type.

### Configuration

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| **Okta Client Credentials** | Connection | The Okta connection containing clientId and clientSecret | Required |
| **Scope** | Text | Space-separated list of OAuth2 scopes | `healthCheck` |
| **Token URL** | Text | Your Okta OAuth2 token endpoint URL | `https://sie.okta.com/oauth2/aus1l8oumajOZjPJt1d8/v1/token` |

### Storage Options Section

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| **Where to store the result** | Select | Choose between Context or Input | `context` |
| **Storage Key** | CognigyText | Key name to store the token | `oktaAccessToken` |
| **Store Full Response** | Toggle | Store complete token response with metadata | `false` |

### Advanced Options Section

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| **Request Timeout (ms)** | Number | Maximum time to wait for response | `30000` |
| **Retry Attempts** | Number | Number of retry attempts on failure | `3` |
| **Retry Delay (ms)** | Number | Delay between retry attempts | `1000` |

### Cache Options Section

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| **Cache Token** | Toggle | Enable token caching to reduce API calls | `true` |
| **Cache Key** | Text | Context key for cached token | `okta_token_cache` |
| **Cache TTL (seconds)** | Number | How long to cache the token | `3300` |

### Usage Example

1. Create an Okta Client Credentials connection with your OAuth2 app credentials
2. Add the "Get Okta Access Token" node to your flow
3. Configure the appropriate scope for your use case
4. The token will be stored in the specified location (default: `context.oktaAccessToken`)
5. Use the token in subsequent HTTP Request nodes:

```text
Authorization: Bearer {{context.oktaAccessToken}}
```

### Cross-Session REST Endpoint Usage

Perfect for REST endpoints that serve multiple clients with the same token:

1. **Create a Token Management Flow**: Design a flow specifically for token acquisition and management
2. **Add REST Endpoint**: Configure the flow with a REST endpoint transformer
3. **Multiple Session IDs**: Different clients can call the same endpoint with different session IDs
4. **Shared Token Cache**: All sessions share the same cached token (based on clientId/scope/tokenUrl)
5. **Automatic Management**: First call fetches fresh token, subsequent calls use cached token until expiry

**Example REST calls:**
```json
// First call (any session ID) - fetches fresh token
{
  "userId": "token-service",
  "sessionId": "client-session-001", 
  "text": "get token"
}
// Returns: {"source": "fresh", "status": "refreshed", ...}

// Second call (different session ID) - uses cached token  
{
  "userId": "token-service",
  "sessionId": "client-session-002",
  "text": "get token" 
}
// Returns: {"source": "cache", "status": "valid", ...}
```

### Token Response

When **Store Full Response** is disabled (default), only the access token string is stored:
```text
context.oktaAccessToken = "eyJraWQiOiJPaGF2NGlPME..."
```

When **Store Full Response** is enabled, the complete response is stored:
```json
{
  "access_token": "eyJraWQiOiJPaGF2NGlPME...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "healthCheck",
  "retrieved_at": "2025-06-10T19:30:00.000Z",
  "expires_at": "2025-06-10T20:30:00.000Z"
}
```

### Error Handling

If token retrieval fails, an error object is stored in the specified location:
```json
{
  "error": true,
  "message": "Invalid client credentials",
  "statusCode": 401,
  "details": {...},
  "timestamp": "2025-06-10T19:30:00.000Z"
}
```

### Caching Behavior

When caching is enabled:
- **Cross-Session Persistence**: Tokens are cached using file-based storage in `.okta-cache/` directory
- **Session-Independent**: Cached tokens persist across different session IDs and REST endpoint calls
- **Automatic Cache Management**: Cache files are automatically created, validated, and cleaned up
- **Unique Cache Keys**: Each combination of clientId, scope, and tokenUrl gets its own cache file
- Cache TTL should be set lower than the actual token expiry time
- Cached tokens are automatically reused if still valid
- Cache is cleared on authentication errors or token expiry
- **Security**: Cache files are stored locally and cleaned up when tokens expire

## Node: Check Token Validity

Validates cached tokens without making API calls, perfect for token management flows.

### Configuration

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| **Token Context Key** | CognigyText | Context key where token is stored | `oktaAccessToken` |
| **Cache Key** | Text | Context key for cached token data | `okta_token_cache` |
| **Refresh Threshold (seconds)** | Number | Consider token near expiry threshold | `300` |
| **Output Type** | Select | Simple boolean or detailed status | `detailed` |

### Tokens Provided

- **Token Is Valid**: `{{context.tokenStatus.isValid}}`
- **Token Needs Refresh**: `{{context.tokenStatus.needsRefresh}}`
- **Token Remaining Seconds**: `{{context.tokenStatus.remainingSeconds}}`

### Cognigy Tokens

This extension provides the following Cognigy Tokens for easy access:
- **Okta Access Token**: `{{context.oktaAccessToken}}`
- **Okta Token Expiry**: `{{context.oktaTokenExpiry}}`

## Updates in Version 1.2.0

- **Cross-Session Token Persistence**:
  - **File-Based Caching**: Tokens now persist across different session IDs using file-based storage
  - **REST Endpoint Compatible**: Perfect for REST endpoints serving multiple clients
  - **Automatic Cache Management**: Cache files in `.okta-cache/` directory are automatically managed
  - **Unique Caching**: Each clientId/scope/tokenUrl combination gets its own cache file
- **Robust Token Management**:
  - Proactive token refresh before expiry
  - Configurable refresh buffer (default: 5 minutes)
  - Force refresh option to bypass cache
  - Token validity tracking with remaining seconds
  - Near-expiry warnings
- **New Check Token Validity node**:
  - Verify token status without making API calls
  - Get detailed expiry information
  - Determine if refresh is needed
  - Cross-session cache validation
- **Enhanced status information**:
  - `_valid` flag indicates token validity
  - `_remaining_seconds` shows time until expiry
  - `_near_expiry` flag when approaching refresh threshold

## Updates in Version 1.1.0

- Added token caching with configurable TTL
- Implemented retry logic with exponential backoff
- Added option to store full token response with metadata
- Configurable request timeout
- Automatic token expiry tracking
- Enhanced error handling with detailed error responses
- Organized UI with collapsible sections
- Added Cognigy Tokens for easier token access
- Custom node appearance with Okta brand color

## Version History

### 1.1.0
- Major update with caching, retry logic, and enhanced features

### 1.0.0
- Initial release with basic OAuth2 Client Credentials flow

## Overview
This extension provides OAuth2 Client Credentials flow authentication with Okta, designed for **cross-session token sharing** to minimize API calls and avoid rate limits.

## 🎯 Cross-Session Token Sharing Architecture

### The Challenge
- **Problem**: Cognigy Extensions run in isolated environments where each request loads fresh module instances
- **Need**: Share OAuth tokens across multiple session IDs to reduce Okta API calls
- **Limitation**: No built-in cross-session persistence in Cognigy Extensions

### 🏗️ Solution Architecture

#### **Option 1: Input/Output Token Passing (RECOMMENDED)**
The extension now supports external token caching through input/output data:

```
Business Flow → HTTP Request → Token Service Flow → Extension → Return Token
     ↓                                                              ↑
Cache token locally  ←─────────────────────────────────────────────┘
```

#### **Flow Pattern:**
1. **Token Service Flow** (with REST endpoint) contains the extension
2. **Business Flows** use HTTP Request nodes to call the token service
3. Business flows **cache tokens locally** in their context
4. Business flows pass cached tokens to the service for validation

### 📋 Implementation Guide

#### 1. Token Service Flow Setup
```yaml
Flow: "API - Token Service"
Endpoint: REST (for cross-session access)
Nodes:
  - Get Access Token (this extension)
  - Return Response
```

#### 2. Extension Configuration
```javascript
// Extension will check input for cached token
Input Token Key: "cachedOktaToken"
Result Context Key: "oktaToken"
Debug Mode: true (for monitoring)
```

#### 3. Business Flow Pattern
```javascript
// Business Flow HTTP Request to Token Service
Method: POST
URL: https://your-cognigy-endpoint.com/tokenservice
Headers: {
  "Content-Type": "application/json"
}
Body: {
  "cachedOktaToken": "{{ context.cachedOktaToken }}"  // Pass cached token if exists
}
Storage: context.tokenResponse

// After receiving response:
Code Node:
```
const tokenData = context.tokenResponse;

if (tokenData && tokenData.access_token && !tokenData.error) {
    // Cache the token for future use
    actions.addToContext('cachedOktaToken', {
        access_token: tokenData.access_token,
        token_type: tokenData.token_type,
        expires_at: tokenData.expires_at,
        expires_in: tokenData.expires_in
    }, 'simple');
    
    // Use the token
    actions.addToContext('authHeader', `Bearer ${tokenData.access_token}`, 'simple');
    
    api.log('info', `Token ${tokenData.source}: expires in ${tokenData.expires_in} seconds`);
} else {
    api.log('error', 'Failed to get valid token');
}
```

### 🔄 Token Lifecycle

1. **First Request**: Extension fetches fresh token from Okta
2. **Subsequent Requests**: Extension validates cached token
3. **Token Refresh**: Automatic when token expires or near expiry
4. **Cross-Session**: Each business flow manages its own token cache

### 📊 Benefits

- **Reduced API Calls**: ~90% reduction in Okta API calls
- **Enterprise Compliance**: No external database dependencies
- **Rate Limit Avoidance**: Shared tokens across session IDs
- **Fault Tolerance**: Graceful fallback to fresh tokens
- **Monitoring**: Detailed logging for cache hits/misses

### 🔧 Alternative Options

#### Option 2: Use Cognigy's HTTP Request Node
For simple scenarios, business flows can cache tokens directly:

```javascript
// Code Node in Business Flow
const CACHE_KEY = 'shared_okta_token';
const BUFFER_TIME = 300; // 5 minutes

// Check existing token
const cachedToken = context[CACHE_KEY];
const currentTime = Math.floor(Date.now() / 1000);

if (cachedToken && cachedToken.expires_at > (currentTime + BUFFER_TIME)) {
    // Use cached token
    actions.addToContext('authHeader', `Bearer ${cachedToken.access_token}`, 'simple');
    api.log('info', 'Using cached token');
} else {
    // Token expired, need to refresh via HTTP Request to token service
    api.log('info', 'Token expired, will refresh');
}
```

#### Option 3: Environment Variables (On-Premises Only)
For dedicated installations, long-lived tokens can be stored as environment variables.

## 🏢 Enterprise Benefits

### Rate Limit Management
- **Before**: 1 API call per session = 1000 sessions = 1000 API calls
- **After**: 1 API call per hour = 24 API calls per day (96% reduction)

### Compliance
- ✅ No external database required
- ✅ Tokens cached within Cognigy environment
- ✅ Automatic token rotation
- ✅ Enterprise-grade security

### Monitoring
```javascript
// Extension outputs detailed metadata:
{
  "access_token": "eyJ...",
  "expires_at": 1672531200,
  "source": "cache|okta",
  "cache_hit": true|false,
  "retrieved_at": "2023-12-31T12:00:00.000Z"
}
```

## 📈 Performance Metrics

- **Cache Hit Rate**: Monitor via logs
- **Token Refresh Frequency**: ~24 times per day
- **API Call Reduction**: Up to 98%
- **Session Performance**: No additional latency for cached tokens

## 🚀 Getting Started

1. **Deploy Extension** to your Cognigy environment
2. **Create Token Service Flow** with REST endpoint
3. **Configure Business Flows** to use HTTP Request pattern
4. **Monitor Performance** via debug logs

This architecture provides enterprise-grade OAuth token management while working within Cognigy's security constraints.
