"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onErrorCreatedIncident = exports.onSuccesCreatedIncident = exports.createIncidentNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
const snowAuth_1 = require("../../lib/snowAuth");
exports.createIncidentNode = extension_tools_1.createNodeDescriptor({
    type: "createIncident",
    defaultLabel: "Create Incident (Support)",
    summary: "Create a new incident in Service Now",
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
            key: "shortDescription",
            label: "Short Description",
            description: "A short description of the incident.",
            type: "cognigyText",
            params: {
                required: true
            }
        },
        {
            key: "urgency",
            label: "Urgency",
            description: "The urgency of the incident. E.g. 4.",
            type: "select",
            defaultValue: "3",
            params: {
                required: true,
                options: [
                    {
                        label: "3 - Low",
                        value: "3"
                    },
                    {
                        label: "2 - Medium",
                        value: "2"
                    },
                    {
                        label: "1 - High",
                        value: "1"
                    }
                ]
            }
        },
        {
            key: "impact",
            label: "Impact",
            description: "The impact of the incident. E.g. 4.",
            type: "select",
            defaultValue: "3",
            params: {
                required: true,
                options: [
                    {
                        label: "3 - Low",
                        value: "3"
                    },
                    {
                        label: "2 - Medium",
                        value: "2"
                    },
                    {
                        label: "1 - High",
                        value: "1"
                    }
                ]
            }
        },
        {
            key: "callerId",
            label: "Caller ID",
            description: "The ID of the person on behalf of which the incident is raised. E.g. David.Miller",
            type: "cognigyText",
            defaultValue: "David.Miller",
            params: {
                required: true
            }
        },
        {
            key: "description",
            label: "Description",
            description: "The full description of the incident.",
            type: "cognigyText",
            params: {
                required: true,
                multiline: true
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
            defaultValue: "snow.createdIncident",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "snow.createdIncident",
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
            key: "priority",
            label: "Priority",
            defaultCollapsed: true,
            fields: [
                "urgency",
                "impact"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "shortDescription" },
        { type: "field", key: "callerId" },
        { type: "field", key: "description" },
        { type: "section", key: "priority" },
        { type: "section", key: "storageOption" }
    ],
    tokens: [
        {
            label: "Created Incident Number",
            script: "ci.snow.createdIncident.number",
            type: "answer"
        },
        {
            label: "Created Incident Description",
            script: "ci.snow.createdIncident.short_description",
            type: "answer"
        }
    ],
    appearance: {
        color: "#80b6a1"
    },
    dependencies: {
        children: [
            "onSuccesCreatedIncident",
            "onErrorCreatedIncident"
        ]
    },
    function: async ({ cognigy, config, childConfigs }) => {
        const { api } = cognigy;
        const { connection, shortDescription, urgency, impact, callerId, description, storeLocation, inputKey, contextKey } = config;
        try {
            const { baseUrl, accessToken } = await snowAuth_1.getSnowAuth(connection);
            const data = {
                "short_description": shortDescription,
                "urgency": urgency,
                "impact": impact,
                "caller_id": callerId,
                "description": description
            };
            const response = await axios_1.default.post(`${baseUrl}/api/now/table/incident`, data, {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const onSuccessChild = childConfigs.find(child => child.type === "onSuccesCreatedIncident");
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
            const onErrorChild = childConfigs.find(child => child.type === "onErrorCreatedIncident");
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
exports.onSuccesCreatedIncident = extension_tools_1.createNodeDescriptor({
    type: "onSuccesCreatedIncident",
    parentType: "createIncident",
    defaultLabel: "On Success",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});
exports.onErrorCreatedIncident = extension_tools_1.createNodeDescriptor({
    type: "onErrorCreatedIncident",
    parentType: "createIncident",
    defaultLabel: "On Error",
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});
//# sourceMappingURL=createIncident.js.map