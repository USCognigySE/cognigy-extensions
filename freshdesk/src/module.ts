import { createExtension } from "@cognigy/extension-tools";

import { createTicketNode } from "./nodes/tickets/createTicket";
import { freshdeskAPIKeyConnection } from "./connections/freshdeskAPIKeyConnection";
import { getTicketNode, onFoundTicket, onNotFoundTicket } from "./nodes/tickets/getTicket";
import { updateTicketNode } from "./nodes/tickets/updateTicket";
import { filterTicketsNode, onFoundTicketByFilter, onNotFoundTicketsByFilter } from "./nodes/tickets/filterTickets";
import { replyToTicketNode } from "./nodes/tickets/replyToTicket";
import { searchArticlesNode, onFoundArticles, onNotFoundArticles } from "./nodes/solutions/searchArticles";
import { getArticleNode, onArticleFound, onArticleNotFound } from "./nodes/solutions/getArticle";


export default createExtension({
	nodes: [
		createTicketNode,

		getTicketNode,
		onFoundTicket,
		onNotFoundTicket,

		updateTicketNode,

		filterTicketsNode,
		onFoundTicketByFilter,
		onNotFoundTicketsByFilter,

		replyToTicketNode,

		searchArticlesNode,
		onFoundArticles,
		onNotFoundArticles,

		getArticleNode,
		onArticleFound,
		onArticleNotFound
	],

	connections: [
		freshdeskAPIKeyConnection
	],

	options: {
		label: "Freshdesk"
	}
});