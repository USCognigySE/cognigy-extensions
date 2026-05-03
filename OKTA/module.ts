import { createExtension } from "@cognigy/extension-tools";

// Import connections
import { oktaClientCredentials } from "./src/connections/oktaClientCredentials";

// Import nodes
import { getAccessToken } from "./src/nodes/getAccessToken";
import { checkTokenValidityNode } from "./src/nodes/checkTokenValidity";

export default createExtension({
	nodes: [
		getAccessToken,
		checkTokenValidityNode
	],
	connections: [
		oktaClientCredentials
	],
	options: {
		label: "Okta Authentication"
	}
}); 