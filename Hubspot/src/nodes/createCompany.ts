import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";
import { Client } from '@hubspot/api-client';

const EXTENSION_TIMEOUT = 10000;

// Define common company properties interface
interface ICompanyProperties {
	name?: string;
	domain?: string;
	industry?: string;
	description?: string;
	phone?: string;
	address?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
	website?: string;
	[key: string]: any; // Allow custom properties
}

export interface ICreateCompanyParams extends INodeFunctionBaseParams {
	config: {
		properties: { [key: string]: string };
		connection: {
			accessToken: string;
		};
		storeLocation: string;
		contextKey: string;
		inputKey: string;
	};
}

export const createCompanyNode = createNodeDescriptor({
	type: "createCompany",
	defaultLabel: "Create Company",
	fields: [
		{
			key: "connection",
			label: "The Hubspot connection which should be used.",
			type: "connection",
			params: {
				required: true,
				connectionType: "hubspot"
			}
		},
		{
			key: "properties",
			label: "Company Properties",
			type: "json",
			params: {
				required: true
			},
			description: "JSON object with HubSpot company properties (e.g., name, domain, industry)",
			defaultValue: `{
    "name": "Company X",
    "domain": "example.com"
}`
		},
		{
			key: "storeLocation",
			type: "select",
			label: "Where to store the result",
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
			label: "Input Key to store Result",
			defaultValue: "hubspot",
			condition: {
				key: "storeLocation",
				value: "input",
			}
		},
		{
			key: "contextKey",
			type: "cognigyText",
			label: "Context Key to store Result",
			defaultValue: "hubspot",
			condition: {
				key: "storeLocation",
				value: "context",
			}
		},
	],
	sections: [
		{
			key: "storage",
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
		{ type: "field", key: "properties" },
		{ type: "section", key: "storage" },
	],
	appearance: {
		color: "#fa7820"
	},
	function: (async ({ cognigy, config }: ICreateCompanyParams) => {
		const { api } = cognigy;
		const {
			storeLocation,
			contextKey,
			inputKey,
			properties,
			connection
		} = config;
		const { accessToken } = connection;

		try {
			if (storeLocation === "context") api.deleteContext(contextKey);

			const result = await Promise.race([
				createCompany(properties, accessToken),
				new Promise((resolve, reject) => setTimeout(() => resolve({ "error": "timeout" }), EXTENSION_TIMEOUT))
			]);

			if (storeLocation === "context") api.addToContext(contextKey, result, "simple");
			else api.addToInput(inputKey, result);

		} catch (err: unknown) {
			const resultObject = {
				result: null,
				error: err instanceof Error ? err.message : String(err)
			};
			if (storeLocation === "context") {
				api.addToContext(contextKey, resultObject, "simple");
			} else {
				api.addToInput(inputKey, resultObject);
			}
		}
	}) as any
});

/**
 * Creates a company in Hubspot
 * @param properties The company properties object
 * @param accessToken The accessToken to use
 */
async function createCompany(properties: { [key: string]: string }, accessToken: string): Promise<any> {
	if (!properties) return Promise.reject("No company properties defined.");

	try {
		const client = new Client({ accessToken });

		const response = await client.crm.companies.basicApi.create({
			properties: properties as { [key: string]: string },
			associations: []
		});

		return response;
	} catch (err: unknown) {
		throw new Error(err instanceof Error ? err.message : String(err));
	}
}
