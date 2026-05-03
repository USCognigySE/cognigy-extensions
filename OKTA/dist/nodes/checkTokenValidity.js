"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTokenValidityNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
exports.checkTokenValidityNode = (0, extension_tools_1.createNodeDescriptor)({
    type: "checkTokenValidity",
    defaultLabel: "Check Token Validity",
    summary: "Checks if an Okta token is still valid and provides expiry information",
    fields: [
        {
            key: "tokenKey",
            label: "Token Context Key",
            type: "cognigyText",
            defaultValue: "oktaAccessToken",
            description: "The context key where the token is stored"
        },
        {
            key: "cacheKey",
            label: "Cache Key",
            type: "text",
            defaultValue: "okta_token_cache",
            description: "The context key where the cached token data is stored"
        },
        {
            key: "refreshThreshold",
            label: "Refresh Threshold (seconds)",
            type: "number",
            defaultValue: 300,
            description: "Consider token 'near expiry' when less than this many seconds remain",
            params: {
                min: 60,
                max: 1800
            }
        },
        {
            key: "outputType",
            label: "Output Type",
            type: "select",
            defaultValue: "detailed",
            params: {
                options: [
                    { label: "Simple Boolean", value: "boolean" },
                    { label: "Detailed Status", value: "detailed" }
                ]
            }
        }
    ],
    appearance: {
        color: "#0066CC" // Darker blue for utility node
    },
    tokens: [
        {
            label: "Token Is Valid",
            script: "context.tokenStatus.isValid",
            type: "context"
        },
        {
            label: "Token Needs Refresh",
            script: "context.tokenStatus.needsRefresh",
            type: "context"
        },
        {
            label: "Token Remaining Seconds",
            script: "context.tokenStatus.remainingSeconds",
            type: "context"
        }
    ],
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        const typedConfig = config;
        const tokenKey = typedConfig.tokenKey || "oktaAccessToken";
        const cacheKey = typedConfig.cacheKey || "okta_token_cache";
        const refreshThreshold = typedConfig.refreshThreshold || 300;
        const outputType = typedConfig.outputType || "detailed";
        try {
            // Check multiple sources for cached token data for cross-session persistence
            // Priority: Input -> Context -> Previous stored data
            let cachedData = cognigy.input[cacheKey] || cognigy.context[cacheKey];
            if (!cachedData || !cachedData.tokenExpiresAt) {
                // No cached data found
                const status = {
                    isValid: false,
                    exists: false,
                    needsRefresh: true,
                    message: "No cached token found"
                };
                if (outputType === "boolean") {
                    api.addToContext("tokenValid", false, "simple");
                }
                else {
                    api.addToContext("tokenStatus", status, "simple");
                }
                // Store status in output for cross-session access
                api.addToContext("output", {
                    source: "cache",
                    status: "missing",
                    message: "No cached token found",
                    needsRefresh: true
                }, "simple");
                api.log("info", "No cached token found");
                return;
            }
            const now = Date.now();
            const expiresAt = cachedData.tokenExpiresAt;
            const remainingMs = expiresAt - now;
            const remainingSeconds = Math.floor(remainingMs / 1000);
            const isValid = remainingSeconds > 0;
            const needsRefresh = remainingSeconds <= refreshThreshold;
            const status = {
                isValid: isValid,
                exists: true,
                needsRefresh: needsRefresh,
                remainingSeconds: Math.max(0, remainingSeconds),
                expiresAt: new Date(expiresAt).toISOString(),
                message: isValid
                    ? (needsRefresh ? "Token valid but nearing expiry" : "Token is valid")
                    : "Token has expired"
            };
            if (outputType === "boolean") {
                api.addToContext("tokenValid", isValid && !needsRefresh, "simple");
            }
            else {
                api.addToContext("tokenStatus", status, "simple");
            }
            // If token is valid and doesn't need refresh, provide it in output
            if (isValid && !needsRefresh) {
                api.addToContext("output", {
                    source: "cache",
                    status: "valid",
                    message: "Using cached token",
                    access_token: cachedData.access_token,
                    expires_at: new Date(expiresAt).toISOString(),
                    remaining_seconds: remainingSeconds
                }, "simple");
                // Set flag to skip refresh
                api.addToContext("skipRefresh", true, "simple");
            }
            else {
                // Token needs refresh or is invalid
                api.addToContext("output", {
                    source: "cache",
                    status: needsRefresh ? "needs_refresh" : "expired",
                    message: status.message,
                    remaining_seconds: Math.max(0, remainingSeconds)
                }, "simple");
            }
            // Log status
            if (!isValid) {
                api.log("warn", `Token expired ${Math.abs(remainingSeconds)} seconds ago`);
            }
            else if (needsRefresh) {
                api.log("info", `Token expires in ${remainingSeconds} seconds - refresh recommended`);
            }
            else {
                api.log("info", `Token valid for ${remainingSeconds} more seconds`);
            }
        }
        catch (err) {
            api.log("error", `Error checking token validity: ${err.message}`);
            const errorStatus = {
                isValid: false,
                exists: false,
                needsRefresh: true,
                error: true,
                message: err.message
            };
            if (outputType === "boolean") {
                api.addToContext("tokenValid", false, "simple");
            }
            else {
                api.addToContext("tokenStatus", errorStatus, "simple");
            }
            // Error output for cross-session handling
            api.addToContext("output", {
                source: "cache",
                status: "error",
                message: err.message,
                needsRefresh: true
            }, "simple");
        }
    }
});
