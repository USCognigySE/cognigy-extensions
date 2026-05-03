"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceCatalogDetailsNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
const snowAuth_1 = require("../../lib/snowAuth");
exports.getServiceCatalogDetailsNode = extension_tools_1.createNodeDescriptor({
    type: "getServiceCatalogDetails",
    defaultLabel: "Get Details (Service Catalog)",
    summary: "Get detailed information about a given catalog",
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
            key: "catalogId",
            label: "Catalog Id",
            description: "The sys_id of the catalog; e.g. e0d08b13c3330100c8b837659bba8fb4",
            type: "cognigyText",
            defaultValue: "",
            params: {
                required: true
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
            defaultValue: "snow.catalog",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "snow.catalog",
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
        { type: "field", key: "catalogId" },
        { type: "section", key: "storageOption" },
    ],
    appearance: {
        color: "#80b6a1"
    },
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        const { connection, catalogId, storeLocation, inputKey, contextKey } = config;
        try {
            const { baseUrl, accessToken } = await snowAuth_1.getSnowAuth(connection);
            let url = `${baseUrl}/api/sn_sc/servicecatalog/catalogs/${catalogId}`;
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
//# sourceMappingURL=getServiceCatalogDetails.js.map