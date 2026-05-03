"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onNotFoundTicketsByFilter = exports.onFoundTicketByFilter = exports.filterTicketsNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
exports.filterTicketsNode = extension_tools_1.createNodeDescriptor({
    type: "filterTickets",
    defaultLabel: {
        default: "Filter Tickets",
        deDE: "Filtere Tickets",
        esES: "Filtrar Tickets"
    },
    summary: {
        default: "Returns all tickets based on a given filter",
        deDE: "Erhält alle Tickets anhand eines Filters",
        esES: "Devuelve todos los tickets basados en un filtro dado"
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
            key: "filter",
            label: "Filter",
            type: "cognigyText",
            description: "Format: (ticket_field:integer OR ticket_field:'string') AND ticket_field:boolean",
            defaultValue: "priority:3",
            params: {
                required: true,
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
        { type: "field", key: "filter" },
        { type: "section", key: "storage" },
    ],
    appearance: {
        color: "#20a849"
    },
    dependencies: {
        children: [
            "onFoundTicketByFilter",
            "onNotFoundTicketsByFilter"
        ]
    },
    function: async ({ cognigy, config, childConfigs }) => {
        const { api } = cognigy;
        const { filter, connection, storeLocation, contextKey, inputKey } = config;
        const { key, subdomain } = connection;
        try {
            const response = await axios_1.default({
                method: "get",
                url: `https://${subdomain}.freshdesk.com/api/v2/search/tickets?query="${filter}"`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                auth: {
                    username: key,
                    password: "X"
                }
            });
            const onSuccessChild = childConfigs.find(child => child.type === "onFoundTicketByFilter");
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
            const onErrorChild = childConfigs.find(child => child.type === "onNotFoundTicketsByFilter");
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
exports.onFoundTicketByFilter = extension_tools_1.createNodeDescriptor({
    type: "onFoundTicketByFilter",
    parentType: "filterTickets",
    defaultLabel: {
        default: "On Found",
        deDE: "Tickets gefunden",
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
exports.onNotFoundTicketsByFilter = extension_tools_1.createNodeDescriptor({
    type: "onNotFoundTicketsByFilter",
    parentType: "filterTickets",
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
//# sourceMappingURL=filterTickets.js.map