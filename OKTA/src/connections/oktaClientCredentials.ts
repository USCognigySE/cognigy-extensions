import { IConnectionSchema } from "@cognigy/extension-tools";

export const oktaClientCredentials: IConnectionSchema = {
    type: "okta-client-credentials",
    label: "Okta Client Credentials",
    fields: [
        { fieldName: "clientId" },
        { fieldName: "clientSecret" }
    ]
};