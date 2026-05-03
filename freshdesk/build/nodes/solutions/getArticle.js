"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onArticleNotFound = exports.onArticleFound = exports.getArticleNode = void 0;
const extension_tools_1 = require("@cognigy/extension-tools");
const axios_1 = require("axios");
exports.getArticleNode = extension_tools_1.createNodeDescriptor({
    type: "getArticle",
    defaultLabel: {
        default: "Get Article",
        deDE: "Artikel abrufen",
        esES: "Obtener artículo"
    },
    summary: {
        default: "Retrieves a Freshdesk solution article by its ID",
        deDE: "Ruft einen Freshdesk Solution-Artikel anhand der ID ab",
        esES: "Recupera un artículo de soluciones de Freshdesk por su ID"
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
            key: "articleId",
            label: {
                default: "Article ID",
                deDE: "Artikel ID",
                esES: "ID del artículo"
            },
            type: "cognigyText",
            description: "The ID of the solution article to retrieve.",
            params: {
                required: true
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
            }
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
                value: "input"
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
                value: "context"
            }
        }
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
                "contextKey"
            ]
        }
    ],
    form: [
        { type: "field", key: "connection" },
        { type: "field", key: "articleId" },
        { type: "section", key: "storage" }
    ],
    appearance: {
        color: "#20a849"
    },
    dependencies: {
        children: [
            "onArticleFound",
            "onArticleNotFound"
        ]
    },
    function: async ({ cognigy, config, childConfigs }) => {
        const { api } = cognigy;
        const { connection, articleId, storeLocation, contextKey, inputKey } = config;
        const { key, subdomain } = connection;
        try {
            const response = await axios_1.default({
                method: "get",
                url: `https://${subdomain}.freshdesk.com/api/v2/solutions/articles/${articleId}`,
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json"
                },
                auth: {
                    username: key,
                    password: "X"
                },
                timeout: 15000
            });
            const onFoundChild = childConfigs.find(child => child.type === "onArticleFound");
            if (onFoundChild) {
                api.setNextNode(onFoundChild.id);
            }
            if (storeLocation === "context") {
                api.addToContext(contextKey, response.data, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, response.data);
            }
        }
        catch (error) {
            const onNotFoundChild = childConfigs.find(child => child.type === "onArticleNotFound");
            if (onNotFoundChild) {
                api.setNextNode(onNotFoundChild.id);
            }
            const errorResult = {
                error: error.message
            };
            if (error.response) {
                errorResult.status = error.response.status;
                errorResult.statusText = error.response.statusText;
                errorResult.responseBody = error.response.data;
            }
            if (storeLocation === "context") {
                api.addToContext(contextKey, errorResult, "simple");
            }
            else {
                // @ts-ignore
                api.addToInput(inputKey, errorResult);
            }
        }
    }
});
exports.onArticleFound = extension_tools_1.createNodeDescriptor({
    type: "onArticleFound",
    parentType: "getArticle",
    defaultLabel: {
        default: "On Found",
        deDE: "Artikel gefunden",
        esES: "Encontrado"
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
exports.onArticleNotFound = extension_tools_1.createNodeDescriptor({
    type: "onArticleNotFound",
    parentType: "getArticle",
    defaultLabel: {
        default: "On Not Found",
        deDE: "Artikel nicht gefunden",
        esES: "No encontrado"
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
//# sourceMappingURL=getArticle.js.map