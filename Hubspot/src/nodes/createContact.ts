import { Client } from '@hubspot/api-client';
import { createNodeDescriptor, INodeFunctionBaseParams } from "@cognigy/extension-tools";

export interface ICreateContactParams extends INodeFunctionBaseParams {
    config: {
        connection: {
            accessToken: string;
        };
        properties: { [key: string]: string };
        storeLocation: string;
        inputKey: string;
        contextKey: string;
    };
}

export const createContactNode = createNodeDescriptor({
    type: "createContact",
    defaultLabel: "Create Contact",
    summary: "Creates a new contact in HubSpot",
    fields: [
        {
            key: "connection",
            label: "HubSpot Connection",
            type: "connection",
            params: {
                connectionType: "hubspot",
                required: true
            }
        },
        {
            key: "properties",
            label: "Contact Properties",
            type: "json",
            params: {
                required: true
            },
            description: "JSON object with HubSpot contact properties. Supports both formats: direct properties or wrapped in properties key. Examples: email, firstname, lastname, phone, company, website, lifecyclestage"
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
            }
        },
        {
            key: "inputKey",
            type: "cognigyText",
            label: "Input Key to store Result",
            defaultValue: "contactId",
            condition: {
                key: "storeLocation",
                value: "input"
            }
        },
        {
            key: "contextKey",
            type: "cognigyText",
            label: "Context Key to store Result",
            defaultValue: "contactId",
            condition: {
                key: "storeLocation",
                value: "context"
            }
        }
    ],
    sections: [
        {
            key: "storageOptions",
            label: "Storage Option",
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
        { type: "field", key: "properties" },
        { type: "section", key: "storageOptions" }
    ],
    function: (async ({ cognigy, config }: ICreateContactParams) => {
        const { api } = cognigy;
        const { connection, properties, storeLocation, inputKey, contextKey } = config;

        try {
            const client = new Client({ accessToken: connection.accessToken });
            
            // Handle both direct properties and properties wrapper
            let contactProperties: { [key: string]: string };
            
            if (properties && typeof properties === 'object') {
                // Check if properties is wrapped in a "properties" key
                if (properties.properties && typeof properties.properties === 'object') {
                    // Extract from wrapper: { "properties": { ... } }
                    contactProperties = properties.properties;
                    api.log("info", "Detected properties wrapper, extracting inner properties");
                } else {
                    // Direct properties: { "email": "...", "firstname": "..." }
                    contactProperties = properties;
                    api.log("info", "Using direct properties");
                }
            } else {
                throw new Error('Properties must be provided as an object');
            }
            
            // Ensure all property values are strings and filter out null/undefined
            const formattedProperties: { [key: string]: string } = {};
            Object.keys(contactProperties).forEach(key => {
                if (contactProperties[key] !== null && contactProperties[key] !== undefined) {
                    formattedProperties[key] = String(contactProperties[key]);
                }
            });
            
            // Validate that we have at least one property
            if (Object.keys(formattedProperties).length === 0) {
                throw new Error('At least one contact property must be provided');
            }
            
            // Log the formatted properties for debugging
            api.log("info", `Creating contact with properties: ${JSON.stringify(formattedProperties)}`);
            
            const response = await client.crm.contacts.basicApi.create({ 
                properties: formattedProperties,
                associations: []
            });
            
            // Store the result based on the selected location
            if (storeLocation === "context") {
                api.addToContext(contextKey, response.id, "simple");
                api.addToContext("contact", response, "simple");
                api.addToContext("success", true, "simple");
                api.addToContext("debug_properties", formattedProperties, "simple");
            } else {
                api.addToInput(inputKey, response.id);
                api.addToInput("contact", response);
                api.addToInput("success", true);
                api.addToInput("debug_properties", formattedProperties);
            }
        } catch (error: unknown) {
            let errorMessage: string;
            let errorDetails: any = {};
            
            if (error instanceof Error) {
                errorMessage = error.message;
                errorDetails = { 
                    name: error.name, 
                    stack: error.stack,
                    message: error.message 
                };
            } else {
                errorMessage = String(error);
                errorDetails = { rawError: error };
            }
            
            if (storeLocation === "context") {
                api.addToContext("error", errorMessage, "simple");
                api.addToContext("errorDetails", errorDetails, "simple");
                api.addToContext("success", false, "simple");
            } else {
                api.addToInput("error", errorMessage);
                api.addToInput("errorDetails", errorDetails);
                api.addToInput("success", false);
            }
        }
    }) as any
});
