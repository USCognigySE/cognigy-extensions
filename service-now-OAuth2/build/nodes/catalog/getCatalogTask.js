"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onErrorGetCatalogTask = exports.onSuccesGetCatalogTask = exports.getCatalogTaskNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
const snowAuth_1 = require("../../lib/snowAuth");
exports.getCatalogTaskNode = extension_tools_1.createNodeDescriptor({
    type: "getCatalogTask",
    defaultLabel: "Get Task (Service Catalog)",
    summary: "Get a Service Catalog Task with a given number",
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
            key: "taskNumber",
            label: "Task Number",
            description: "The number of the task; e.g. SCTASK0010003",
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
            defaultValue: "snow.task",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "snow.task",
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
        { type: "field", key: "taskNumber" },
        { type: "section", key: "storageOption" }
    ],
    tokens: [
        {
            label: "Task Number",
            script: "ci.snow.task[0].number",
            type: "answer"
        },
        {
            label: "Task State",
            script: "ci.snow.task[0].state",
            type: "answer"
        },
        {
            label: "Task Description",
            script: "ci.task[0].description",
            type: "answer"
        }
    ],
    appearance: {
        color: "#80b6a1"
    },
    dependencies: {
        children: [
            "onSuccesGetCatalogTask",
            "onErrorGetCatalogTask"
        ]
    },
    function: async ({ cognigy, config, childConfigs }) => {
        const { api } = cognigy;
        const { connection, storeLocation, inputKey, contextKey, taskNumber } = config;
        try {
            const { baseUrl, accessToken } = await snowAuth_1.getSnowAuth(connection);
            let query = "";
            query = taskNumber ? `number=${taskNumber}` : "";
            let url = `${baseUrl}/api/now/table/sc_task?sysparm_query=${query}`;
            const response = await axios_1.default.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const onSuccessChild = childConfigs.find(child => child.type === "onSuccesGetCatalogTask");
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
            const onErrorChild = childConfigs.find(child => child.type === "onErrorGetCatalogTask");
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
exports.onSuccesGetCatalogTask = extension_tools_1.createNodeDescriptor({
    type: "onSuccesGetCatalogTask",
    parentType: "getCatalogTask",
    defaultLabel: "On Success",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});
exports.onErrorGetCatalogTask = extension_tools_1.createNodeDescriptor({
    type: "onErrorGetCatalogTask",
    parentType: "getCatalogTask",
    defaultLabel: "On Error",
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});
//# sourceMappingURL=getCatalogTask.js.map