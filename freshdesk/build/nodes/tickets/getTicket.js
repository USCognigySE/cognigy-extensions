"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNotFoundTicket = exports.onFoundTicket = exports.getTicketNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
exports.getTicketNode = extension_tools_1.createNodeDescriptor({
    type: "getTicket",
    defaultLabel: {
        default: "Get Ticket",
        deDE: "Erhalte Ticket",
        esES: "Obtener Ticket"
    },
    summary: {
        default: "Retrieves the information about a given ticket",
        deDE: "Erhält alle Infos über ein bestimmtes Ticket",
        esES: "Recupera la información sobre un ticket determinado"
    },
    fields: [
        {
            key: "connection",
            label: {
                default: "Freshdesk Connection",
                deDE: "Freshdesk Verbindung",
                esES: "Freshdesk Conexión"
            },
            type: "connection",
            params: {
                connectionType: "freshdesk-apikey",
                required: true
            }
        },
        {
            key: "ticketId",
            label: "Ticket ID",
            type: "cognigyText",
            description: {
                default: "The ID of the support ticket",
                deDE: "Die ID des Support Tickets",
                esES: "La identificación del ticket de soporte"
            },
            params: {
                required: true,
            },
        },
        {
            key: "storeLocation",
            type: "select",
            label: {
                default: "Where to store the result",
                deDE: "Wo das Ergebnis gespeichert werden soll",
                esES: "Dónde almacenar el resultado"
            },
            defaultValue: "input",
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
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: {
                default: "Input Key to store Result",
                deDE: "Input Key zum Speichern des Ergebnisses",
                esES: "Input Key para almacenar el resultado"
            },
            defaultValue: "freshdesk",
            condition: {
                key: "storeLocation",
                value: "input",
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: {
                default: "Context Key to store Result",
                deDE: "Context Key zum Speichern des Ergebnisses",
                esES: "Context Key para almacenar el resultado"
            },
            defaultValue: "freshdesk",
            condition: {
                key: "storeLocation",
                value: "context",
            }
        },
    ],
    sections: [
        {
            key: "storage",
            label: {
                default: "Storage Option",
                deDE: "Speicheroption",
                esES: "Opción de almacenamiento"
            },
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
        { type: "field", key: "ticketId" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#20a849"
    },
    dependencies: {
        children: [
            "onFoundTicket",
            "onNotFoundTicket"
        ]
    },
    function: async ({ cognigy, config, childConfigs }) => {
        const { api } = cognigy;
        const { ticketId, connection, storeLocation, contextKey, inputKey } = config;
        const { key, subdomain } = connection;
        try {
            const response = await axios_1.default({
                method: "get",
                url: `https://${subdomain}.freshdesk.com/api/v2/tickets/${ticketId}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                auth: {
                    username: key,
                    password: "X"
                }
            });
            const onSuccessChild = childConfigs.find(child => child.type === "onFoundTicket");
            api.setNextNode(onSuccessChild.id);
            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }
        }
        catch (error) {
            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundTicket");
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
exports.onFoundTicket = extension_tools_1.createNodeDescriptor({
    type: "onFoundTicket",
    parentType: "getTicket",
    defaultLabel: {
        default: "On Found",
        deDE: "Ticket gefunden",
        esES: "Encontre"
    },
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});
exports.onNotFoundTicket = extension_tools_1.createNodeDescriptor({
    type: "onNotFoundTicket",
    parentType: "getTicket",
    defaultLabel: {
        default: "On Not Found",
        deDE: "Nichts gefunden",
        esES: "Nada Encontrado"
    },
    constraints: {
        editable: false,
        deletable: false,
        creatable: false,
        movable: false,
        placement: {
            predecessor: {
                whitelist: []
            }
        }
    },
    appearance: {
        color: "#61d188",
        textColor: "white",
        variant: "mini"
    }
});
//# sourceMappingURL=getTicket.js.map