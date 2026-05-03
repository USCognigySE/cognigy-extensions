"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authHeaders = exports.getSnowAuth = exports.normaliseInstanceUrl = void 0;
const axios_1 = require("axios");
function normaliseInstanceUrl(instance) {
    const trimmed = (instance || "").trim().replace(/\/+$/, "");
    if (!trimmed) {
        throw new Error("ServiceNow instance URL is required");
    }
    if (/^https?:\/\//i.test(trimmed))
        return trimmed;
    return `https://${trimmed}`;
}
exports.normaliseInstanceUrl = normaliseInstanceUrl;
async function getSnowAuth(connection) {
    const baseUrl = normaliseInstanceUrl(connection.instance);
    const url = `${baseUrl}/oauth_token.do`;
    const body = new URLSearchParams({
        grant_type: "password",
        client_id: connection.clientId,
        client_secret: connection.clientSecret,
        username: connection.username,
        password: connection.password
    }).toString();
    try {
        const res = await axios_1.default.post(url, body, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "*/*",
                "User-Agent": "Cognigy.AI"
            },
            timeout: 30000
        });
        const data = res.data || {};
        if (!data.access_token) {
            throw new Error(`OAuth response missing access_token: ${JSON.stringify(data)}`);
        }
        return { baseUrl, accessToken: data.access_token };
    }
    catch (err) {
        const status = err && err.response && err.response.status;
        const payload = err && err.response && err.response.data;
        const detail = payload ? ` body=${JSON.stringify(payload)}` : "";
        throw new Error(`ServiceNow OAuth token request failed (status=${status || "n/a"})${detail}: ${err && err.message ? err.message : err}`);
    }
}
exports.getSnowAuth = getSnowAuth;
function authHeaders(auth, extra) {
    return Object.assign({ Accept: "application/json", Authorization: `Bearer ${auth.accessToken}` }, (extra || {}));
}
exports.authHeaders = authHeaders;
//# sourceMappingURL=snowAuth.js.map