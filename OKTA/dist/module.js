"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_tools_1 = require("@cognigy/extension-tools");
// Import connections
const oktaClientCredentials_1 = require("./src/connections/oktaClientCredentials");
// Import nodes
const getAccessToken_1 = require("./src/nodes/getAccessToken");
const checkTokenValidity_1 = require("./src/nodes/checkTokenValidity");
exports.default = (0, extension_tools_1.createExtension)({
    nodes: [
        getAccessToken_1.getAccessToken,
        checkTokenValidity_1.checkTokenValidityNode
    ],
    connections: [
        oktaClientCredentials_1.oktaClientCredentials
    ],
    options: {
        label: "Okta Authentication"
    }
});
