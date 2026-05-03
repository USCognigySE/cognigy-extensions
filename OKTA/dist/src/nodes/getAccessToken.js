"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccessToken = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = __importDefault(require("axios"));
exports.getAccessToken = (0, extension_tools_1.createNodeDescriptor)({
    type: "getAccessToken",
    defaultLabel: "Get Access Token",
    summary: "Retrieves an Okta access token using client credentials flow with support for external token caching",
    fields: [
        {
            key: "connection",
            label: "Okta Connection",
            type: "connection",
            params: {
                connectionType: "okta-client-credentials",
                required: true
            }
        },
        {
            key: "oktaBaseUrl",
            label: "Okta Base URL",
            type: "cognigyText",
            defaultValue: "https://your-domain.okta.com",
            params: {
                required: true
            },
            description: "Your Okta domain URL (e.g., https://your-domain.okta.com)"
        },
        {
            key: "scope",
            label: "Scope",
            type: "cognigyText",
            defaultValue: "healthCheck",
            description: "Space-separated list of scopes for the token request"
        },
        {
            key: "resultKey",
            label: "Result Context Key",
            type: "cognigyText",
            defaultValue: "oktaToken",
            params: {
                required: true
            }
        },
        {
            key: "inputTokenKey",
            label: "Input Token Key (Optional)",
            type: "cognigyText",
            defaultValue: "cachedOktaToken",
            description: "Key to check for existing token in input object"
        },
        {
            key: "debugMode",
            label: "Debug Mode",
            type: "toggle",
            defaultValue: false
        }
    ],
    sections: [
        {
            key: "general",
            label: "General Settings",
            defaultCollapsed: false,
            fields: ["connection", "oktaBaseUrl", "scope", "resultKey"]
        },
        {
            key: "caching",
            label: "External Caching Support",
            defaultCollapsed: false,
            fields: ["inputTokenKey"]
        },
        {
            key: "debugging",
            label: "Debugging",
            defaultCollapsed: true,
            fields: ["debugMode"]
        }
    ],
    form: [
        { type: "section", key: "general" },
        { type: "section", key: "caching" },
        { type: "section", key: "debugging" }
    ],
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        // Cast config to our expected interface
        const typedConfig = config;
        const { connection, oktaBaseUrl, scope, resultKey, inputTokenKey, debugMode } = typedConfig;
        try {
            // Check for existing token in input
            const inputToken = cognigy.input.data?.[inputTokenKey];
            if (debugMode) {
                api.log('debug', `[OKTA-TOKEN] Checking for cached token in input.${inputTokenKey}`);
            }
            // If we have a cached token, validate it first
            if (inputToken && inputToken.access_token && inputToken.expires_at) {
                const currentTime = Math.floor(Date.now() / 1000);
                const bufferTime = 300; // 5 minutes buffer
                if (inputToken.expires_at > (currentTime + bufferTime)) {
                    if (debugMode) {
                        api.log('debug', `[OKTA-TOKEN] Using cached token, expires in ${inputToken.expires_at - currentTime} seconds`);
                    }
                    // Return cached token with metadata
                    const result = {
                        ...inputToken,
                        source: 'cache',
                        retrieved_at: new Date().toISOString(),
                        cache_hit: true
                    };
                    api.addToContext(resultKey, result, 'simple');
                    api.addToInput('oktaTokenResult', result);
                    return;
                }
                else {
                    if (debugMode) {
                        api.log('debug', `[OKTA-TOKEN] Cached token expired, fetching new token`);
                    }
                }
            }
            // Fetch new token from Okta
            // Check if oktaBaseUrl already includes the token endpoint
            const tokenUrl = oktaBaseUrl.includes('/v1/token')
                ? oktaBaseUrl
                : `${oktaBaseUrl}/oauth2/default/v1/token`;
            // Always log the attempt to fetch token
            api.log('info', `[OKTA-TOKEN] Fetching new token from: ${tokenUrl}`);
            if (debugMode) {
                api.log('debug', `[OKTA-TOKEN] Using client ID: ${connection.clientId?.substring(0, 8)}...`);
            }
            // Use form-encoded body with client credentials (like working version)
            const response = await axios_1.default.post(tokenUrl, new URLSearchParams({
                client_id: connection.clientId,
                client_secret: connection.clientSecret,
                scope: scope || 'healthCheck', // Use configured scope
                grant_type: 'client_credentials'
            }).toString(), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                timeout: 10000 // 10 second timeout
            });
            if (response.status === 200 && response.data.access_token) {
                const currentTime = Math.floor(Date.now() / 1000);
                const result = {
                    access_token: response.data.access_token,
                    token_type: response.data.token_type || 'Bearer',
                    expires_in: response.data.expires_in,
                    expires_at: currentTime + (response.data.expires_in || 3600),
                    scope: response.data.scope,
                    source: 'okta',
                    retrieved_at: new Date().toISOString(),
                    cache_hit: false,
                    // Additional metadata for external caching
                    okta_base_url: oktaBaseUrl,
                    client_id: connection.clientId
                };
                if (debugMode) {
                    api.log('debug', `[OKTA-TOKEN] Successfully fetched new token, expires in ${result.expires_in} seconds`);
                }
                // Store in context and input for both internal use and external caching
                api.addToContext(resultKey, result, 'simple');
                api.addToInput('oktaTokenResult', result);
                // Store in standard cache format for flow compatibility
                const cacheData = {
                    access_token: result.access_token,
                    tokenExpiresAt: result.expires_at * 1000, // Convert to milliseconds
                    token_type: result.token_type,
                    scope: result.scope,
                    retrieved_at: result.retrieved_at
                };
                api.addToContext('okta_token_cache', cacheData, 'simple');
            }
            else {
                throw new Error(`Unexpected response from Okta: ${response.status}`);
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            // Always log errors, regardless of debug mode
            api.log('error', `[OKTA-TOKEN] Error fetching token: ${errorMessage}`);
            if (error instanceof Error && error.stack) {
                api.log('error', `[OKTA-TOKEN] Stack trace: ${error.stack}`);
            }
            const errorResult = {
                error: true,
                message: errorMessage,
                source: 'error',
                retrieved_at: new Date().toISOString(),
                cache_hit: false,
                access_token: null,
                expires_at: 0
            };
            api.addToContext(resultKey, errorResult, 'simple');
            api.addToInput('oktaTokenResult', errorResult);
            // Store in standard cache format for flow compatibility (with null values)
            const cacheData = {
                access_token: null,
                tokenExpiresAt: 0,
                token_type: null,
                scope: null,
                retrieved_at: errorResult.retrieved_at
            };
            api.addToContext('okta_token_cache', cacheData, 'simple');
        }
    }
});
