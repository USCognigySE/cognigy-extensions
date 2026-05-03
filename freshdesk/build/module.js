"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extension_tools_1 = require("@cognigy/extension-tools");
const createTicket_1 = require("./nodes/tickets/createTicket");
const freshdeskAPIKeyConnection_1 = require("./connections/freshdeskAPIKeyConnection");
const getTicket_1 = require("./nodes/tickets/getTicket");
const updateTicket_1 = require("./nodes/tickets/updateTicket");
const filterTickets_1 = require("./nodes/tickets/filterTickets");
const replyToTicket_1 = require("./nodes/tickets/replyToTicket");
const searchArticles_1 = require("./nodes/solutions/searchArticles");
const getArticle_1 = require("./nodes/solutions/getArticle");
exports.default = extension_tools_1.createExtension({
    nodes: [
        createTicket_1.createTicketNode,
        getTicket_1.getTicketNode,
        getTicket_1.onFoundTicket,
        getTicket_1.onNotFoundTicket,
        updateTicket_1.updateTicketNode,
        filterTickets_1.filterTicketsNode,
        filterTickets_1.onFoundTicketByFilter,
        filterTickets_1.onNotFoundTicketsByFilter,
        replyToTicket_1.replyToTicketNode,
        searchArticles_1.searchArticlesNode,
        searchArticles_1.onFoundArticles,
        searchArticles_1.onNotFoundArticles,
        getArticle_1.getArticleNode,
        getArticle_1.onArticleFound,
        getArticle_1.onArticleNotFound
    ],
    connections: [
        freshdeskAPIKeyConnection_1.freshdeskAPIKeyConnection
    ],
    options: {
        label: "Freshdesk"
    }
});
//# sourceMappingURL=module.js.map