# OKTA Token Service - Complete Documentation

## Overview

This document describes a comprehensive **OKTA Token Service** solution built with Cognigy.AI that provides persistent, cross-session access token management. The service eliminates redundant API calls to OKTA by maintaining a shared token cache accessible via REST API.

## Table of Contents

1. [Architecture](#architecture)
2. [Components](#components)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Code Implementation](#code-implementation)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)
9. [Technical Reference](#technical-reference)

---

## Architecture

### High-Level Design

```
┌─────────────────┐    HTTP Request    ┌──────────────────┐
│   Client Flow   │ ──────────────────► │  Token Service   │
│                 │                     │     Flow         │
├─────────────────┤                     ├──────────────────┤
│ HTTP Request    │                     │ Check Token      │
│ Node            │                     │ Validity Node    │
└─────────────────┘                     ├──────────────────┤
                                        │ If Node          │
                                        │ (tokenIsValid)   │
┌─────────────────┐    Bearer Token     ├──────────────────┤
│   REST API      │ ◄─────────────────  │ Then: Code Node  │
│   Response      │                     │ (Cached Token)   │
└─────────────────┘                     ├──────────────────┤
                                        │ Else: Get Access │
                                        │ Token Node       │
                                        │ (Fresh Token)    │
                                        └──────────────────┘
```

### Key Concepts

- **Persistent Session**: Fixed `userId` and `sessionId` maintain context across requests
- **Token Caching**: Tokens stored in session context with expiration tracking
- **Smart Refresh**: Automatic token refresh 5 minutes before expiry
- **Cross-Session Access**: Multiple flows can access the same cached token

---

## Components

### 1. Cognigy Extension - OKTA Authentication v1.2.0

**Files:**
- `src/connections/oktaClientCredentials.ts` - Connection schema
- `src/nodes/getAccessToken.ts` - Token retrieval node  
- `src/nodes/checkTokenValidity.ts` - Token validation node
- `module.ts` - Extension definition

### 2. Token Service Flow

**Flow Structure:**
1. **Check Token Validity Node** - Validates existing token
2. **If Node** - Routes based on token validity (`context.tokenIsValid === true`)
3. **Then Branch** - Returns cached token (Code Node + Say Node)
4. **Else Branch** - Fetches fresh token (Get Access Token Node + Code Node + Say Node)

### 3. REST Endpoint Configuration

- **Transformer** - Handles HTTP requests and responses
- **Fixed Session** - Uses persistent `userId: "token-service"` and `sessionId`

---

## Installation

### Step 1: Extension Installation

1. **Compile the Extension:**
   ```bash
   npm install
   npm run build
   ```

2. **Upload to Cognigy.AI:**
   - Navigate to Extensions in Cognigy.AI
   - Upload the `dist` folder contents
   - Verify extension appears in Extensions list

### Step 2: Connection Setup

1. **Create OKTA Connection:**
   - Type: `okta-client-credentials`
   - Client ID: Your OKTA application client ID
   - Client Secret: Your OKTA application client secret

### Step 3: Flow Creation

1. **Create Token Service Flow:**
   - Name: `API - Token Service` (or similar)
   - Configure nodes as described in Configuration section

2. **Create REST Endpoint:**
   - Attach to Token Service Flow
   - Configure REST Transformer (see Configuration)

---

## Configuration

### 1. Check Token Validity Node

```yaml
Token Context Key: oktaToken
Cache Key: okta_token_cache  
Refresh Threshold (seconds): 300
Output Type: Detailed Status
```

### 2. Get Access Token Node

```yaml
Connection: [Your OKTA Connection]
Okta Base URL: https://sie.okta.com/oauth2/aus1l8oumajOZjPJt1d8/v1/token
Scope: healthCheck
Result Context Key: oktaToken
Input Token Key: cachedOktaToken
Debug Mode: false
```

### 3. If Node Condition

```javascript
context.tokenIsValid === true
```

### 4. Code Node - Cached Token (Then Branch)

```javascript
// Fixed Cognigy Code Node Script
// All variables now properly declared with 'var', 'let', or 'const'

const cache = context.okta_token_cache;

if (!cache || !cache.access_token || !cache.tokenExpiresAt) {
    context.output = {
        source: "cache",
        status: "error", 
        message: "Cache data is invalid",
        access_token: null,
        expires_at: null,
        remaining_seconds: null
    };
} else {
    const currentTime = new Date().getTime();
    const remainingMs = cache.tokenExpiresAt - currentTime;
    const remainingSeconds = parseInt(remainingMs / 1000);
    
    context.output = {
        source: "cache",
        status: "valid",
        message: "Using cached token",
        access_token: cache.access_token,
        expires_at: cache.tokenExpiresAt,
        remaining_seconds: remainingSeconds > 0 ? remainingSeconds : 0,
        token_type: cache.token_type ? cache.token_type : "Bearer",
        scope: cache.scope
    };
}

// Build JSON string with proper null handling
const accessToken = context.output.access_token;
const expiresAt = context.output.expires_at;
const remainingSecs = context.output.remaining_seconds;
const tokenType = context.output.token_type;
const tokenScope = context.output.scope;

let outputJson = '{';
outputJson += '"source":"' + context.output.source + '",';
outputJson += '"status":"' + context.output.status + '",';
outputJson += '"message":"' + context.output.message + '",';
outputJson += '"access_token":' + (accessToken ? '"' + accessToken + '"' : 'null') + ',';
outputJson += '"expires_at":' + (expiresAt ? '"' + expiresAt + '"' : 'null') + ',';
outputJson += '"remaining_seconds":' + (remainingSecs !== null ? remainingSecs : 'null') + ',';
outputJson += '"token_type":"' + (tokenType ? tokenType : 'Bearer') + '",';
outputJson += '"scope":' + (tokenScope ? '"' + tokenScope + '"' : 'null');
outputJson += '}';

context.sanitizedText = "__CXT__" + outputJson + "__CXT__";
```

### 5. Code Node - Fresh Token (Else Branch)

```javascript
// Fixed Cognigy Code Node Script - Token Refresh Version
// All variables now properly declared with 'var', 'let', or 'const'

const cache = context.okta_token_cache;

if (!cache || !cache.access_token || !cache.tokenExpiresAt) {
    context.output = {
        source: "fresh",
        status: "error",
        message: "Failed to refresh token",
        access_token: null,
        expires_at: null,
        remaining_seconds: null
    };
} else {
    const currentTime = new Date().getTime();
    const remainingMs = cache.tokenExpiresAt - currentTime;
    const remainingSeconds = parseInt(remainingMs / 1000);
    
    context.output = {
        source: "fresh",
        status: "refreshed", 
        message: "Token refreshed successfully",
        access_token: cache.access_token,
        expires_at: cache.tokenExpiresAt,
        remaining_seconds: remainingSeconds > 0 ? remainingSeconds : 0,
        token_type: cache.token_type ? cache.token_type : "Bearer",
        scope: cache.scope
    };
}

// Build JSON string with proper null handling
const accessToken = context.output.access_token;
const expiresAt = context.output.expires_at;
const remainingSecs = context.output.remaining_seconds;
const tokenType = context.output.token_type;
const tokenScope = context.output.scope;

let outputJson = '{';
outputJson += '"source":"' + context.output.source + '",';
outputJson += '"status":"' + context.output.status + '",';
outputJson += '"message":"' + context.output.message + '",';
outputJson += '"access_token":' + (accessToken ? '"' + accessToken + '"' : 'null') + ',';
outputJson += '"expires_at":' + (expiresAt ? '"' + expiresAt + '"' : 'null') + ',';
outputJson += '"remaining_seconds":' + (remainingSecs !== null ? remainingSecs : 'null') + ',';
outputJson += '"token_type":"' + (tokenType ? tokenType : 'Bearer') + '",';
outputJson += '"scope":' + (tokenScope ? '"' + tokenScope + '"' : 'null');
outputJson += '}';

context.sanitizedText = "__CXT__" + outputJson + "__CXT__";
```

### 6. Say Nodes

Both Then and Else branches use identical Say Nodes:

```handlebars
{{context.sanitizedText}}
```

### 7. REST Endpoint Transformer

```javascript
createRestTransformer({
  handleInput: async ({ endpoint, request, response }) => {
    const { userId, sessionId, text } = request.body;

    return {
      userId,
      sessionId,
      text,
      data: null
    };
  },

  handleOutput: async ({ output }) => {
    return output;
  },

  handleExecutionFinished: async ({ outputs }) => {
    let bearerPayload;

    // Search outputs for the one containing the context output we injected via __CXT__
    for (const o of outputs) {
      if (typeof o.text === "string" && o.text.includes("__CXT__")) {
        const match = o.text.match(/__CXT__(.*?)__CXT__/);
        if (match && match[1]) {
          try {
            bearerPayload = JSON.parse(match[1]);
            break;
          } catch (err) {
            bearerPayload = { error: "Failed to parse token JSON." };
          }
        }
      }
    }

    return {
      body: bearerPayload || {
        error: "context.output not found in any output. Ensure your Code Node sets context.output = { ... }"
      },
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      }
    };
  }
});
```

---

## Usage

### 1. Calling the Token Service

**HTTP Request Configuration:**

```http
POST https://endpoint-trial-us.cognigy.ai/[your-endpoint-token]
Content-Type: application/json

{
  "userId": "token-service",
  "sessionId": "PERSISTENT-TOKEN-SESSION-001",
  "text": "get token"
}
```

**Key Requirements:**
- **Fixed userId**: `"token-service"` (maintains persistent session)
- **Fixed sessionId**: Use consistent value across all requests
- **Any text**: The text content doesn't matter for token requests

### 2. Response Formats

**Cached Token Response:**
```json
{
  "source": "cache",
  "status": "valid",
  "message": "Using cached token",
  "access_token": "eyJraWQiOiJMMXBBQ0FVYkQ4bjNqOFNYVU9FOF...",
  "expires_at": "1750441386000",
  "remaining_seconds": 1696,
  "token_type": "Bearer",
  "scope": "healthCheck"
}
```

**Fresh Token Response:**
```json
{
  "source": "fresh",
  "status": "refreshed",
  "message": "Token refreshed successfully",
  "access_token": "eyJraWQiOiJMMXBBQ0FVYkQ4bjNqOFNYVU9FOF...",
  "expires_at": "1750441386000",
  "remaining_seconds": 3600,
  "token_type": "Bearer",
  "scope": "healthCheck"
}
```

**Error Response:**
```json
{
  "source": "fresh",
  "status": "error",
  "message": "Failed to refresh token",
  "access_token": null,
  "expires_at": null,
  "remaining_seconds": null
}
```

### 3. Integration Example

**Node.js/JavaScript:**
```javascript
async function getOktaToken() {
    const response = await fetch('https://endpoint-trial-us.cognigy.ai/[your-endpoint]', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            userId: 'token-service',
            sessionId: 'PERSISTENT-TOKEN-SESSION-001',
            text: 'get token'
        })
    });
    
    const data = await response.json();
    return data.access_token;
}

// Usage
const token = await getOktaToken();
console.log('Bearer', token);
```

**HTTP Request Node (Cognigy):**
```yaml
URL: https://endpoint-trial-us.cognigy.ai/[your-endpoint]
Method: POST
Headers:
  Content-Type: application/json
Body:
  userId: token-service
  sessionId: PERSISTENT-TOKEN-SESSION-001
  text: get token
Store Result: context.bearerToken
```

---

## Code Implementation

### Extension Files

The complete extension source code includes:

**Connection Schema (`src/connections/oktaClientCredentials.ts`):**
```typescript
import { IConnectionSchema } from "@cognigy/extension-tools";

export const oktaClientCredentials: IConnectionSchema = {
    type: "okta-client-credentials",
    label: "Okta Client Credentials",
    fields: [
        { fieldName: "clientId" },
        { fieldName: "clientSecret" }
    ]
};
```

**Get Access Token Node** - Handles OKTA API authentication using form-encoded client credentials
**Check Token Validity Node** - Validates cached tokens and sets context flags for flow control

---

## Testing

### 1. Unit Testing

**Test Fresh Token Retrieval:**
1. Clear any existing cache
2. Call token service
3. Verify response contains `"source": "fresh"`
4. Verify valid JWT token returned

**Test Token Caching:**
1. Call token service twice in succession
2. First call: `"source": "fresh"`
3. Second call: `"source": "cache"`
4. Verify same access token returned

**Test Token Refresh:**
1. Wait until token has <300 seconds remaining
2. Call token service
3. Verify response contains `"source": "fresh"`
4. Verify new access token issued

### 2. Integration Testing

**Test Cross-Session Access:**
1. Call token service from Flow A
2. Call token service from Flow B (different session)
3. Verify both receive same cached token

**Test Error Handling:**
1. Configure invalid OKTA credentials
2. Call token service
3. Verify error response returned

### 3. Load Testing

**Test Concurrent Requests:**
1. Send multiple simultaneous requests
2. Verify all return same cached token
3. Verify no duplicate OKTA API calls

---

## Troubleshooting

### Common Issues

**1. HTTP 400 Bad Request from OKTA**
- **Cause**: Incorrect authentication method or invalid credentials
- **Solution**: Verify client ID/secret and ensure using form-encoded body (not Basic auth)

**2. "No cached token found"**
- **Cause**: Using different session ID or cleared cache
- **Solution**: Ensure consistent `userId` and `sessionId` across requests

**3. "json is not defined" Error**
- **Cause**: Using `JSON.stringify()` in Cognigy Script
- **Solution**: Use manual JSON string building as shown in Code Nodes

**4. Token Not Refreshing**
- **Cause**: If node condition incorrect or context flags not set
- **Solution**: Verify `context.tokenIsValid === true` condition and Check Token Validity configuration

### Debug Methods

**Enable Debug Logging:**
```javascript
// Add to Code Nodes for debugging
api.log("info", "Token status: " + context.tokenIsValid);
api.log("info", "Cache exists: " + (context.okta_token_cache ? "YES" : "NO"));
```

**Check Context Values:**
Use Cognigy's Interaction Panel to inspect:
- `context.tokenIsValid`
- `context.tokenStatus`
- `context.okta_token_cache`

**Verify Token Expiration:**
```javascript
// Check token expiry in Code Node
currentTime = new Date().getTime();
if (context.okta_token_cache) {
    remainingMs = context.okta_token_cache.tokenExpiresAt - currentTime;
    api.log("info", "Token remaining: " + Math.floor(remainingMs/1000) + " seconds");
}
```

---

## Technical Reference

### Data Structures

**Token Cache Structure:**
```typescript
interface TokenCache {
    access_token: string;
    tokenExpiresAt: number;  // Unix timestamp in milliseconds
    token_type: string;      // Usually "Bearer"
    scope: string;           // Token scope
    retrieved_at: string;    // ISO timestamp
}
```

**Token Status Structure:**
```typescript
interface TokenStatus {
    isValid: boolean;
    exists: boolean;
    needsRefresh: boolean;
    remainingSeconds: number;
    expiresAt: string;      // ISO timestamp
    message: string;
}
```

### Context Variables

| Variable | Type | Description |
|----------|------|-------------|
| `context.okta_token_cache` | TokenCache | Cached token data |
| `context.oktaToken` | Object | Current token result |
| `context.tokenIsValid` | boolean | If token is valid and not near expiry |
| `context.tokenNeedsRefresh` | boolean | If token needs refresh |
| `context.tokenStatus` | TokenStatus | Detailed validation status |

### Timing Configuration

| Setting | Value | Purpose |
|---------|--------|---------|
| Refresh Threshold | 300 seconds | Refresh token 5 minutes before expiry |
| OKTA Token TTL | 3600 seconds | Standard 1-hour token lifetime |
| Request Timeout | 10000 ms | OKTA API request timeout |
| Cache Buffer | 5 minutes | Safety margin for token refresh |

### Security Considerations

1. **Credentials Storage**: Client credentials stored securely in Cognigy Connections
2. **Token Exposure**: Tokens only transmitted over HTTPS
3. **Session Isolation**: Each persistent session maintains separate token cache
4. **Automatic Expiry**: Tokens automatically refresh before expiration
5. **Error Handling**: Failed requests don't expose sensitive information

---

## Conclusion

This OKTA Token Service provides a robust, scalable solution for managing access tokens across multiple Cognigy flows. The persistent session approach eliminates redundant API calls while maintaining security and reliability.

**Key Benefits:**
- ✅ Reduced OKTA API calls (cost optimization)
- ✅ Improved performance (cached token retrieval)
- ✅ Automatic token management (no manual intervention)
- ✅ Cross-session accessibility (shared token cache)
- ✅ Built-in error handling and logging

**Maintenance:**
- Monitor token service logs for errors
- Verify OKTA connection credentials remain valid
- Update refresh threshold if token TTL changes
- Scale horizontally by deploying multiple endpoints if needed

---

**Documentation Version:** 1.0  
**Last Updated:** December 2024  
**Extension Version:** 1.2.0 