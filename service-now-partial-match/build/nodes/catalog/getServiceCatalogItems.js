"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceCatalogItemsNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
const snowAuth_1 = require("../../lib/snowAuth");
exports.getServiceCatalogItemsNode = extension_tools_1.createNodeDescriptor({
    type: "getServiceCatalogItems",
    defaultLabel: "Get Items (Service Catalog)",
    summary: "Get all items of a given Service Catalog",
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
            key: "sysParamCatalog",
            type: "cognigyText",
            label: "Service Catalog ID",
            description: "Use this parameter to locate items in a specific catalog"
        },
        {
            key: "sysParamLimit",
            type: "number",
            label: "Limit",
            description: "Maximum number of records to return",
            defaultValue: 100
        },
        {
            key: "sysParamText",
            type: "cognigyText",
            label: "Search Text",
            description: "Specific text for which to search for in the category items",
            defaultValue: ""
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
            defaultValue: "snow.catalog.items",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "snow.catalog.items",
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
        },
        {
            key: "advanced",
            label: "Advanced",
            defaultCollapsed: true,
            fields: [
                "sysParamCatalog",
                "sysParamLimit",
                "sysParamText",
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#80b6a1"
    },
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        const { connection, storeLocation, inputKey, contextKey, sysParamCatalog, sysParamLimit, sysParamText } = config;
        try {
            const { baseUrl, accessToken } = await snowAuth_1.getSnowAuth(connection);
            const response = await axios_1.default.get(`${baseUrl}/api/sn_sc/servicecatalog/items`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                params: {
                    sysparm_catalog: sysParamCatalog,
                    sysparm_limit: sysParamLimit,
                    sysparm_text: sysParamText
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
//# sourceMappingURL=getServiceCatalogItems.js.map