"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTicketNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
exports.createTicketNode = extension_tools_1.createNodeDescriptor({
    type: "createTicket",
    defaultLabel: {
        default: "Create Ticket",
        deDE: "Ticket erstellen",
        esES: "Crear Ticket"
    },
    summary: {
        default: "Creates a new support ticket",
        deDE: "Erstellt ein neues Support Ticket",
        esES: "Crea un nuevo ticket de soporte"
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
            key: "subject",
            label: {
                default: "Subject",
                deDE: "Betreff",
                esES: "Tema"
            },
            type: "cognigyText",
            description: {
                default: "The subject of the new support ticket",
                deDE: "Der Betreff des neuen Tickets",
                esES: "El tema del nuevo ticket de soporte"
            },
            params: {
                required: true
            }
        },
        {
            key: "description",
            label: {
                default: "Description",
                deDE: "Beschreibung",
                esES: "Descripción"
            },
            type: "cognigyText",
            description: {
                default: "The description of the new support ticket",
                deDE: "Die Beschreibung des neuen Tickets",
                esES: "La descripción del nuevo ticket de soporte"
            },
            params: {
                required: true
            }
        },
        {
            key: "email",
            label: {
                default: "Email",
                esES: "Correo"
            },
            type: "cognigyText",
            description: {
                default: "The email of the user",
                deDE: "Die Email der Nutzerin",
                esES: "El correo del usuario"
            },
            params: {
                required: true
            }
        },
        {
            key: "priority",
            label: {
                default: "Priority",
                deDE: "Priorität",
                esES: "Prioridad"
            },
            type: "select",
            description: {
                default: "The priority of the new support ticket",
                deDE: "Die Priorität des neuen Tickets",
                esES: "La prioridad del nuevo ticket de soporte"
            },
            defaultValue: 1,
            params: {
                options: [
                    {
                        label: "Low",
                        value: 1
                    },
                    {
                        label: "Medium",
                        value: 2
                    },
                    {
                        label: "High",
                        value: 3
                    },
                    {
                        label: "Urgent",
                        value: 4
                    }
                ]
            }
        },
        {
            key: "status",
            label: {
                default: "Status"
            },
            type: "select",
            description: {
                default: "The status of the new support ticket",
                deDE: "Der Status des neuen Tickets",
                esES: "El status del nuevo ticket de soporte"
            },
            defaultValue: 2,
            params: {
                options: [
                    {
                        label: "Open",
                        value: 2
                    },
                    {
                        label: "Pending",
                        value: 3
                    },
                    {
                        label: "Resolved",
                        value: 4
                    },
                    {
                        label: "Closed",
                        value: 5
                    }
                ]
            }
        },
        {
            key: "source",
            label: {
                default: "Source",
                deDE: "Quelle",
                esES: "Origen"
            },
            type: "select",
            description: {
                default: "The source of the new support ticket",
                deDE: "Die Quelle des neuen Tickets",
                esES: "El origen del nuevo ticket de soporte"
            },
            defaultValue: 7,
            params: {
                options: [
                    {
                        label: "Email",
                        value: 1
                    },
                    {
                        label: "Portal",
                        value: 2
                    },
                    {
                        label: "Phone",
                        value: 3
                    },
                    {
                        label: "Chat",
                        value: 7
                    }
                ]
            }
        },
        {
            key: "additionalFields",
            label: {
                default: "Additional Fields (JSON)",
                deDE: "Zusätzliche Felder (JSON)",
                esES: "Campos adicionales (JSON)"
            },
            type: "json",
            description: "Optional JSON merged into the ticket payload (e.g. type, group_id, custom_fields). Form fields take precedence.",
            defaultValue: `{
	"type": "Question",
	"group_id": null,
	"custom_fields": {
		"cf_topic": ""
	}
}`,
            params: {
                required: false
            }
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
            key: "advanced",
            label: {
                default: "Advanced",
                deDE: "Optional",
                esES: "Advanzada"
            },
            defaultCollapsed: true,
            fields: [
                "status",
                "priority",
                "source",
                "additionalFields",
            ]
        },
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
        { type: "field", key: "subject" },
        { type: "field", key: "description" },
        { type: "field", key: "email" },
        { type: "section", key: "advanced" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#20a849"
    },
    function: async ({ cognigy, config }) => {
        const { api } = cognigy;
        const { connection, description, priority, subject, email, status, source, additionalFields, storeLocation, contextKey, inputKey } = config;
        const { key, subdomain } = connection;
        let extra = {};
        if (additionalFields) {
            if (typeof additionalFields === "string") {
                try {
                    extra = JSON.parse(additionalFields);
                }
                catch (e) {
                    extra = {};
                }
            }
            else if (typeof additionalFields === "object") {
                extra = additionalFields;
            }
        }
        const payload = Object.assign(Object.assign({}, extra), { description,
            subject,
            email,
            priority,
            status,
            source });
        Object.keys(payload).forEach(k => {
            if (payload[k] === null || payload[k] === undefined || payload[k] === "") {
                delete payload[k];
            }
        });
        try {
            const response = await axios_1.default({
                method: "post",
                url: `https://${subdomain}.freshdesk.com/api/v2/tickets`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                data: payload,
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
            const result = {
                error: error.message,
                requestPayload: payload
            };
            if (error.response) {
                result.status = error.response.status;
                result.statusText = error.response.statusText;
                result.responseBody = error.response.data;
            }
            if (storeLocation === "context") {
                api.addToContext(contextKey, result, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, result);
            }
        }
    }
});
//# sourceMappingURL=createTicket.js.map