import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import axios from "axios";

export interface ISearchArticlesParams extends INodeFunctionBaseParams {
	config: {
		connection: {
			key: string;
			subdomain: string;
		};
		searchTerm: string;
		categoryId: string;
		folderId: string;
		maxResults: number;
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const searchArticlesNode = createNodeDescriptor({
	type: "searchArticles",
	defaultLabel: {
		default: "Search Knowledge",
		deDE: "Wissen durchsuchen",
		esES: "Buscar conocimiento"
	},
	summary: {
		default: "Searches Freshdesk solution articles by keyword, optionally scoped to a category or folder",
		deDE: "Sucht Freshdesk Solution-Artikel nach Stichwort",
		esES: "Busca artículos de soluciones en Freshdesk"
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
			key: "searchTerm",
			label: {
				default: "Search Term",
				deDE: "Suchbegriff",
				esES: "Término de búsqueda"
			},
			type: "cognigyText",
			description: "The keyword or phrase to search for across solution articles.",
			params: {
				required: true
			}
		},
		{
			key: "categoryId",
			label: {
				default: "Category ID",
				deDE: "Kategorie ID",
				esES: "ID de categoría"
			},
			type: "cognigyText",
			description: "Optional. Limits results to a specific solution category."
		},
		{
			key: "folderId",
			label: {
				default: "Folder ID",
				deDE: "Ordner ID",
				esES: "ID de carpeta"
			},
			type: "cognigyText",
			description: "Optional. Limits results to a specific folder."
		},
		{
			key: "maxResults",
			label: {
				default: "Max Results",
				deDE: "Max. Ergebnisse",
				esES: "Máx. resultados"
			},
			type: "number",
			description: "Maximum number of articles to return. Defaults to 5.",
			defaultValue: 5
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
			key: "scope",
			label: {
				default: "Scope (Optional)",
				deDE: "Bereich (Optional)",
				esES: "Alcance (Opcional)"
			},
			defaultCollapsed: true,
			fields: [
				"categoryId",
				"folderId",
				"maxResults"
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
				"contextKey"
			]
		}
	],
	form: [
		{ type: "field", key: "connection" },
		{ type: "field", key: "searchTerm" },
		{ type: "section", key: "scope" },
		{ type: "section", key: "storage" }
	],
	appearance: {
		color: "#20a849"
	},
	dependencies: {
		children: [
			"onFoundArticles",
			"onNotFoundArticles"
		]
	},
	function: async ({ cognigy, config, childConfigs }: ISearchArticlesParams) => {
		const { api } = cognigy;
		const { connection, searchTerm, categoryId, folderId, maxResults, storeLocation, contextKey, inputKey } = config;
		const { key, subdomain } = connection;

		try {
			const params: { [k: string]: any } = { term: searchTerm };
			if (categoryId) {
				params.category_id = categoryId;
			}
			if (folderId) {
				params.folder_id = folderId;
			}

			const response = await axios({
				method: "get",
				url: `https://${subdomain}.freshdesk.com/api/v2/search/solutions`,
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json"
				},
				params,
				auth: {
					username: key,
					password: "X"
				},
				timeout: 15000
			});

			const limit = typeof maxResults === "number" && maxResults > 0 ? maxResults : 5;
			const articles = Array.isArray(response.data) ? response.data.slice(0, limit) : [];
			const totalReturned = Array.isArray(response.data) ? response.data.length : 0;

			const result = {
				articles,
				count: articles.length,
				totalReturned
			};

			if (articles.length > 0) {
				const onFoundChild = childConfigs.find(child => child.type === "onFoundArticles");
				if (onFoundChild) {
					api.setNextNode(onFoundChild.id);
				}
			} else {
				const onNotFoundChild = childConfigs.find(child => child.type === "onNotFoundArticles");
				if (onNotFoundChild) {
					api.setNextNode(onNotFoundChild.id);
				}
			}

			if (storeLocation === "context") {
				api.addToContext(contextKey, result, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, result);
			}
		} catch (error) {
			const onNotFoundChild = childConfigs.find(child => child.type === "onNotFoundArticles");
			if (onNotFoundChild) {
				api.setNextNode(onNotFoundChild.id);
			}

			const errorResult: { [k: string]: any } = {
				error: error.message,
				articles: [],
				count: 0
			};
			if (error.response) {
				errorResult.status = error.response.status;
				errorResult.statusText = error.response.statusText;
				errorResult.responseBody = error.response.data;
			}

			if (storeLocation === "context") {
				api.addToContext(contextKey, errorResult, "simple");
			} else {
				// @ts-ignore
				api.addToInput(inputKey, errorResult);
			}
		}
	}
});

export const onFoundArticles = createNodeDescriptor({
	type: "onFoundArticles",
	parentType: "searchArticles",
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

export const onNotFoundArticles = createNodeDescriptor({
	type: "onNotFoundArticles",
	parentType: "searchArticles",
	defaultLabel: {
		default: "On Not Found",
		deDE: "Keine Artikel",
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
