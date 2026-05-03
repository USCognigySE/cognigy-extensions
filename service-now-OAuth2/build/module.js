"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_tools_1 = require("@cognigy/extension-tools");
// Import Flow Nodes
const getIncident_1 = require("./nodes/incident/getIncident");
const findTicketInText_1 = require("./nodes/incident/findTicketInText");
const createIncident_1 = require("./nodes/incident/createIncident");
const getCatalogRequest_1 = require("./nodes/catalog/getCatalogRequest");
const getCatalogTask_1 = require("./nodes/catalog/getCatalogTask");
const getServiceCatalogs_1 = require("./nodes/catalog/getServiceCatalogs");
const getServiceCatalogDetails_1 = require("./nodes/catalog/getServiceCatalogDetails");
const addToServiceCatalogCart_1 = require("./nodes/catalog/addToServiceCatalogCart");
const orderServiceCatalogItem_1 = require("./nodes/catalog/orderServiceCatalogItem");
// Import Connections
const snowConnection_1 = require("./connections/snowConnection");
const getServiceCatalogItems_1 = require("./nodes/catalog/getServiceCatalogItems");
const getArticles_1 = require("./nodes/knowledge/getArticles");
const sendEmail_1 = require("./nodes/email/sendEmail");
exports.default = extension_tools_1.createExtension({
    nodes: [
        getIncident_1.getIncidentNode,
        getIncident_1.onSuccesGetIncident,
        getIncident_1.onErrorGetIncident,
        createIncident_1.createIncidentNode,
        createIncident_1.onSuccesCreatedIncident,
        createIncident_1.onErrorCreatedIncident,
        findTicketInText_1.findTicketInTextNode,
        getCatalogRequest_1.getCatalogRequestNode,
        getCatalogTask_1.getCatalogTaskNode,
        getCatalogTask_1.onSuccesGetCatalogTask,
        getCatalogTask_1.onErrorGetCatalogTask,
        getServiceCatalogs_1.getServiceCatalogsNode,
        getServiceCatalogDetails_1.getServiceCatalogDetailsNode,
        getServiceCatalogItems_1.getServiceCatalogItemsNode,
        addToServiceCatalogCart_1.addToServiceCatalogCartNode,
        addToServiceCatalogCart_1.onSuccesAddToServiceCatalogCart,
        addToServiceCatalogCart_1.onErrorAddToServiceCatalogCart,
        orderServiceCatalogItem_1.orderServiceCatalogItemNode,
        orderServiceCatalogItem_1.onSuccessServiceCatalogOrderNow,
        orderServiceCatalogItem_1.onErrorServiceCatalogOrderNow,
        getArticles_1.getArticlesNode,
        sendEmail_1.sendEmailNode
    ],
    connections: [
        snowConnection_1.snowConnection
    ],
    options: {
        label: "Service Now"
    }
});
//# sourceMappingURL=module.js.map