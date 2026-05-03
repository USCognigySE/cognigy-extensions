"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onErrorAddToServiceCatalogCart = exports.onSuccesAddToServiceCatalogCart = exports.addToServiceCatalogCartNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
const snowAuth_1 = require("../../lib/snowAuth");
exports.addToServiceCatalogCartNode = extension_tools_1.createNodeDescriptor({
    type: "addToServiceCatalogCart",
    defaultLabel: "Add To Cart (Service Catalog)",
    summary: "Add a new item to a Service Catalog cart",
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
            key: "sysId",
            label: "Item Id",
            description: "The ID of the item to add to the current cart",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "sysParamQuantity",
            label: "Quantity",
            description: "The quantity of the item to add to the current cart",
            type: "number",
            defaultValue: 1,
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
            defaultValue: "snow.catalog.cart",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "snow.catalog.cart",
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
        { type: "field", key: "sysId" },
        { type: "field", key: "sysParamQuantity" },
        { type: "section", key: "storageOption" }
    ],
    // tokens: [
    //     {
    //         label: "Service Catalog Cart ID",
    //         script: "ci.snow.catalog.cart.cart_id",
    //         type: "answer"
    //     },
    //     {
    //         label: "Service Catalog Cart Items",
    //         script: "ci.snow.catalog.cart.items",
    //         type: "answer"
    //     },
    //     {
    //         label: "Service Catalog Cart Subtotal Price",
    //         script: "ci.snow.catalog.cart.subtotal",
    //         type: "answer"
    //     }
    // ],
    appearance: {
        color: "#80b6a1"
    },
    dependencies: {
        children: [
            "onSuccesAddToServiceCatalogCart",
            "onErrorAddToServiceCatalogCart"
        ]
    },
    function: async ({ cognigy, config, childConfigs }) => {
        const { api } = cognigy;
        const { connection, storeLocation, inputKey, contextKey, sysId, sysParamQuantity } = config;
        try {
            const { baseUrl, accessToken } = await snowAuth_1.getSnowAuth(connection);
            const response = await axios_1.default.post(`${baseUrl}/api/sn_sc/servicecatalog/items/${sysId}/add_to_cart`, {
                sysparm_quantity: sysParamQuantity.toString()
            }, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const onSuccessChild = childConfigs.find(child => child.type === "onSuccesAddToServiceCatalogCart");
            api.setNextNode(onSuccessChild.id);
            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data.result, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, response.data.result);
            }
        }
        catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onErrorAddToServiceCatalogCart");
            api.setNextNode(onErrorChild.id);
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
exports.onSuccesAddToServiceCatalogCart = extension_tools_1.createNodeDescriptor({
    type: "onSuccesAddToServiceCatalogCart",
    parentType: "addToServiceCatalogCart",
    defaultLabel: "On Success",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});
exports.onErrorAddToServiceCatalogCart = extension_tools_1.createNodeDescriptor({
    type: "onErrorAddToServiceCatalogCart",
    parentType: "addToServiceCatalogCart",
    defaultLabel: "On Error",
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});
//# sourceMappingURL=addToServiceCatalogCart.js.map