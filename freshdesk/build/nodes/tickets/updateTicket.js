"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
exports.updateTicketNode = extension_tools_1.createNodeDescriptor({
    type: "updateTicket",
    defaultLabel: {
        default: "Update Ticket",
        deDE: "Bearbeite Ticket",
        esES: "Actualizar Ticket"
    },
    summary: {
        default: "Updates a given ticket in zendesk",
        deDE: "Bearbeitet ein bestimmtes Ticket in Freshdesk",
        esES: "Actualiza un ticket determinado en Freshdesk"
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
            key: "ticket",
            label: {
                default: "Ticket Data",
                deDE: "Ticket Daten",
                esES: "Datos del ticket"
            },
            type: "json",
            description: {
                default: "The JSON of the ticket to update",
                deDE: "Die JSON Daten des zu bearbeitenden Tickets",
                esES: "La JSON del ticket a actualizar"
            },
            params: {
                required: true,
            },
            defaultValue: `{
	"priority": 2,
	"status": 3
}
			`
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
        { type: "field", key: "ticket" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#20a849"
    },
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        const { ticketId, ticket, connection, storeLocation, contextKey, inputKey } = config;
        const { key, subdomain } = connection;
        try {
            const response = await axios_1.default({
                method: "put",
                url: `https://${subdomain}.freshdesk.com/api/v2/tickets/${ticketId}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: ticket,
                auth: {
                    username: key,
                    password: "X"
                }
            });
            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
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
//# sourceMappingURL=updateTicket.js.map