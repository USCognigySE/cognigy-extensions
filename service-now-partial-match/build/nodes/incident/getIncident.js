"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onErrorGetIncident = exports.onSuccesGetIncident = exports.getIncidentNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
const snowAuth_1 = require("../../lib/snowAuth");
exports.getIncidentNode = extension_tools_1.createNodeDescriptor({
    type: "getIncident",
    defaultLabel: "Get Incident (Support)",
    summary: "Get an incident from Service Now",
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
            key: "incidentNumber",
            label: "Incident Number",
            description: "The number of the incident; e.g. INC012345",
            type: "cognigyText",
            params: {
                required: false
            }
        },
        {
            key: "getDisplayValues",
            label: "Display Values",
            type: "checkbox",
            defaultValue: false
        },
        {
            key: "caller",
            label: "The user that submitted the incident",
            description: "The user that submitted the incident; e.g. David.Miller ",
            type: "cognigyText",
            defaultValue: ""
        },
        {
            key: "category",
            label: "Incident Category",
            description: "The category of the incident; e.g. Software",
            type: "cognigyText",
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
            defaultValue: "snow.incident",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "snow.incident",
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
                "category",
                "caller"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "incidentNumber" },
        { type: "field", key: "getDisplayValues" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storageOption" }
    ],
    tokens: [
        {
            label: "Incident Number",
            script: "ci.snow.incident[0].number",
            type: "answer"
        },
        {
            label: "Incident Caller",
            script: "ci.snow.incident[0].caller_id.value",
            type: "answer"
        },
        {
            label: "Incident Status",
            script: "ci.snow.incident[0].state",
            type: "answer"
        },
        {
            label: "Incident Short Description",
            script: "ci.snow.incident[0].short_description",
            type: "answer"
        },
        {
            label: "Incident Severity",
            script: "ci.snow.incident[0].severity",
            type: "answer"
        },
        {
            label: "Incident Category",
            script: "ci.snow.incident[0].category",
            type: "answer"
        },
        {
            label: "Incident Opened At",
            script: "ci.snow.incident[0].opened_at",
            type: "answer"
        },
        {
            label: "Incident Updated On",
            script: "ci.snow.incident[0].sys_updated_on",
            type: "answer"
        }
    ],
    appearance: {
        color: "#80b6a1"
    },
    dependencies: {
        children: [
            "onSuccesGetIncident",
            "onErrorGetIncident"
        ]
    },
    function: async ({ cognigy, config, childConfigs }) => {
        const { api } = cognigy;
        const { connection, storeLocation, inputKey, contextKey, incidentNumber, caller, category, getDisplayValues } = config;
        try {
            const { baseUrl, accessToken } = await snowAuth_1.getSnowAuth(connection);
            let query = "";
            // Use LIKE so partial ticket numbers (e.g. "877432") match the full record (e.g. INC0877432), matching the ServiceNow UI behavior.
            query = incidentNumber ? `numberLIKE${incidentNumber}` : "";
            query = category ? query + `category=${category}` : query;
            query = caller ? query + `caller=${caller}` : query;
            query = getDisplayValues ? query + `&sysparm_display_value=${getDisplayValues}` : query;
            let url = `${baseUrl}/api/now/table/incident?sysparm_query=${query}`;
            const response = await axios_1.default.get(url, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const onSuccessChild = childConfigs.find(child => child.type === "onSuccesGetIncident");
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
            const onErrorChild = childConfigs.find(child => child.type === "onErrorGetIncident");
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
exports.onSuccesGetIncident = extension_tools_1.createNodeDescriptor({
    type: "onSuccesGetIncident",
    parentType: "getIncident",
    defaultLabel: "On Success",
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});
exports.onErrorGetIncident = extension_tools_1.createNodeDescriptor({
    type: "onErrorGetIncident",
    parentType: "getIncident",
    defaultLabel: "On Error",
    appearance: {
        color: "#cf142b",
        textColor: "white",
        variant: "mini"
    }
});
//# sourceMappingURL=getIncident.js.map