import { IConnectionSchema } from "@cognigy/extension-tools";

export const snowConnection: IConnectionSchema = {
	type: "snow",
	label: "Service Now Connection (OAuth Password Grant)",
	fields: [
		{ fieldName: "instance" },
		{ fieldName: "clientId" },
		{ fieldName: "clientSecret" },
		{ fieldName: "username" },
		{ fieldName: "password" }
	]
};
