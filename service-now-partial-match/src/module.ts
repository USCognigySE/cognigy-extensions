import { createExtension } from "@cognigy/extension-tools";

// Import Flow Nodes
import { getIncidentNode, onErrorGetIncident, onSuccesGetIncident } from "./nodes/incident/getIncident";
import { findTicketInTextNode } from "./nodes/incident/findTicketInText";
import { createIncidentNode, onErrorCreatedIncident, onSuccesCreatedIncident } from "./nodes/incident/createIncident";
import { getCatalogRequestNode } from "./nodes/catalog/getCatalogRequest";
import { getCatalogTaskNode, onErrorGetCatalogTask, onSuccesGetCatalogTask } from "./nodes/catalog/getCatalogTask";
import { getServiceCatalogsNode } from "./nodes/catalog/getServiceCatalogs";
import { getServiceCatalogDetailsNode } from "./nodes/catalog/getServiceCatalogDetails";
import { addToServiceCatalogCartNode, onErrorAddToServiceCatalogCart, onSuccesAddToServiceCatalogCart } from "./nodes/catalog/addToServiceCatalogCart";
import { orderServiceCatalogItemNode, onSuccessServiceCatalogOrderNow, onErrorServiceCatalogOrderNow } from "./nodes/catalog/orderServiceCatalogItem";
import { getWorkOrderNode, onSuccessGetWorkOrder, onErrorGetWorkOrder } from "./nodes/workOrder/getWorkOrder";


// Import Connections
import { snowConnection } from "./connections/snowConnection";
import { getServiceCatalogItemsNode } from "./nodes/catalog/getServiceCatalogItems";
import { getArticlesNode } from "./nodes/knowledge/getArticles";
import { sendEmailNode } from "./nodes/email/sendEmail";


export default createExtension({
	nodes: [
		getIncidentNode,
		onSuccesGetIncident,
		onErrorGetIncident,

		createIncidentNode,
		onSuccesCreatedIncident,
		onErrorCreatedIncident,

		findTicketInTextNode,

		getCatalogRequestNode,

		getCatalogTaskNode,
		onSuccesGetCatalogTask,
		onErrorGetCatalogTask,

		getServiceCatalogsNode,
		getServiceCatalogDetailsNode,
		getServiceCatalogItemsNode,

		addToServiceCatalogCartNode,
		onSuccesAddToServiceCatalogCart,
		onErrorAddToServiceCatalogCart,

		orderServiceCatalogItemNode,
		onSuccessServiceCatalogOrderNow,
		onErrorServiceCatalogOrderNow,

		getWorkOrderNode,
		onSuccessGetWorkOrder,
		onErrorGetWorkOrder,

		getArticlesNode,

		sendEmailNode
	],

	connections: [
		snowConnection
	],

	options: {
		label: "Service Now"
	}
});