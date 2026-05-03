"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCatalogRequestNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
const snowAuth_1 = require("../../lib/snowAuth");
exports.getCatalogRequestNode = extension_tools_1.createNodeDescriptor({
    type: "getCatalogRequest",
    defaultLabel: "Get Request (Service Catalog)",
    fields: [
        {
            key: "connection",
            label: "Service Now Connection",
            type: "connection",
            params: {
                connectionType: "snow",
                required: false
            }
        },
        {
            key: "requestNumber",
            label: "Request Number",
            description: "The number of the request; e.g. REQ0010002",
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: false
            }
        },
        {
            key: "storeLocation",
            type: "select",
            label: "Where to store the result",
            params: {
                options: [
                    {
                        label: "Input",
                        value: "input"
                    },
                    {
                        label: "Context",
                        value: "context"
                    }
                ],
                required: true
            },
            defaultValue: "input"
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "snow.request",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "snow.request",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOption",
            label: "Storage Option",
            defaultCollapsed: true,
            fields: [
                "storeLocation",
                "inputKey",
                "contextKey",
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "requestNumber" },
        { type: "section", key: "storageOption" }
    ],
    tokens: [
        {
            label: "Request Number",
            script: "ci.snow.request[0].number",
            type: "answer"
        },
        {
            label: "Request State",
            script: "ci.snow.request[0].request_state",
            type: "answer"
        }
    ],
    appearance: {
        color: "#80b6a1"
    },
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        const { connection, storeLocation, inputKey, contextKey, requestNumber } = config;
        try {
            const { baseUrl, accessToken } = await snowAuth_1.getSnowAuth(connection);
            let query = "";
            query = requestNumber ? `number=${requestNumber}` : "";
            let url = `${baseUrl}/api/now/table/sc_request?sysparm_query=${query}`;
            const response = await axios_1.default.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data.result, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, response.data.result);
            }
        }
        catch (error) {
            if (storeLocation === "context") {
                api.addToContext(contextKey, { error: error.message }, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, { error: error.message });
            }
        }
    }
});
//# sourceMappingURL=getCatalogRequest.js.map