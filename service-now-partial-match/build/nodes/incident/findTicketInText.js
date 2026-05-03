"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTicketInTextNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
exports.findTicketInTextNode = extension_tools_1.createNodeDescriptor({
    type: "findTicketInText",
    defaultLabel: "Find Ticket in Text",
    fields: [
        {
            key: "ticketType",
            type: "select",
            label: "The type of ticket to look for.",
            params: {
                options: [
                    {
                        label: "Incident (INC)",
                        value: "incident"
                    },
                    {
                        label: "Catalog Request (REQ)",
                        value: "catalogRequest"
                    },
                    {
                        label: "Catalog Task (SCTASK)",
                        value: "catalogTask"
                    },
                    {
                        label: "Work Order (WO)",
                        value: "workOrder"
                    }
                ],
                required: true
            },
            defaultValue: "incident"
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
            defaultValue: "snow.ticket",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "snow.ticket",
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
        { type: "field", key: "ticketType" },
        { type: "section", key: "storageOption" }
    ],
    tokens: [
        {
            label: "Extracted Ticket",
            script: "ci.snow.ticket",
            type: "answer"
        }
    ],
    appearance: {
        color: "#80b6a1"
    },
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        const { ticketType, storeLocation, inputKey, contextKey } = config;
        let pattern;
        // Accept either the full prefixed ticket (e.g. INC0877432, WO4070568) or a bare 6-8 digit fragment (e.g. 877432).
        // Bare digits flow through to a LIKE query in the matching Get node, mirroring ServiceNow's UI partial-match behavior.
        if (ticketType === "incident") {
            pattern = /INC\d+|\b\d{6,8}\b/gi;
        }
        else if (ticketType === "catalogRequest") {
            pattern = /REQ\d+|\b\d{6,8}\b/gi;
        }
        else if (ticketType === "catalogTask") {
            pattern = /SCTASK\d+|\b\d{6,8}\b/gi;
        }
        else {
            pattern = /WO\d+|\b\d{6,8}\b/gi;
        }
        let ticket = cognigy.input.text.match(pattern);
        if (storeLocation === "context") {
            if (ticket) {
                api.addToContext(contextKey, ticket[0], "simple");
            }
        }
        else {
            if (ticket) {
                // @ts-ignore
                api.addToInput(inputKey, ticket[0]);
            }
        }
    }
});
//# sourceMappingURL=findTicketInText.js.map