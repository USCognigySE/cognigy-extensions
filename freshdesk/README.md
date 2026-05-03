# Freshdesk

This Extension can be used for managing tickets in [Freshdesk](https://freshdesk.com/). As source of the exposed Flow Nodes, the [Freshdesk API](https://developers.freshdesk.com/api/#tickets) is used.

## Connection

In order to authenticate the virtual agent to establish a connection with Freshdesk, the **subdomain** and **API KEY** must be provided:

- API Key
  - [How to find your API Key](https://support.freshdesk.com/en/support/solutions/articles/215517)
- Subdomain
  - The value can be found in the URL of the Freshdesk instance, e.g. https:// `company` .freshdesk.com

## Node: Create Ticket

This Flow Node creates a new ticket in Freshdesk with:
- Subject
- Description
- Email
- Status
- Source
- Priority
- Additional Fields (JSON, optional)

The **Additional Fields** input is a JSON object merged into the Create Ticket payload. Use it to send fields not exposed as form inputs — for example `type`, `group_id`, `responder_id`, `company_id`, `cc_emails`, `tags`, `custom_fields`, `due_by`, `fr_due_by`. See the [Freshdesk Create Ticket API](https://developers.freshdesk.com/api/#create_ticket) for the full list of supported keys. Form fields above take precedence over keys provided in this JSON.

Example covering a typical strict-required-field scenario (Type, Group, Topic):

```json
{
	"type": "Employee - Non-HR",
	"group_id": 1060000368676,
	"product_id": 1060000000987,
	"custom_fields": {
		"cf_topic": "Payroll",
		"cf_subtopic": "W-2"
	}
}
```

Notes:
- `group_id` and `product_id` are numeric Freshdesk IDs, not display names. Find them in Freshdesk admin (the URL when viewing a Group/Product contains the ID) or via `GET /api/v2/groups`.
- `type` must match a value defined in your tenant under Admin → Ticket Fields → Type.
- Custom-field keys (e.g. `cf_topic`) are tenant-specific. Confirm them via `GET /api/v2/ticket_fields`.

If the API rejects the request (HTTP 400, 403, etc.), the node now stores the full Freshdesk response — including `status`, `responseBody`, and the exact `requestPayload` sent — under the configured Input/Context key, so you can see why the call failed.

As a response, the new ticket is stored in the [Input](https://docs.cognigy.com/ai/tools/interaction-panel/input/) or [Context](https://docs.cognigy.com/ai/tools/interaction-panel/context/) object.

## Node: Get Ticket

This Flow Node retrieves an existing ticket by a given **Ticket ID**. The response, namely the ticket, is stored in the [Input](https://docs.cognigy.com/ai/tools/interaction-panel/input/) or [Context](https://docs.cognigy.com/ai/tools/interaction-panel/context/) object.

## Node: Update Ticket

This Flow Nodes updates a ticket with a given **Ticket ID** using the available fields: https://developer.freshdesk.com/api/#update_ticket

## Node: Filter Tickets

This Flow Node returns all available tickets based on a given filter. Therefore, one could search for all tickets that are assigned or created by a specific person.

## Node: Reply to Ticket

This Flow Node replies to a Freshdesk ticket and, thus, sends the message to the actual user. Therefore, it answers emails through Freshdesk as well. In a potential scenario, the user is sending an email to the Freshdesk support inbox while this message is forwarded to Cognigy.AI via Freshdesk [Automations](https://support.freshdesk.com/en/support/solutions/articles/37614-setting-up-automation-rules-to-run-on-ticket-creation) and [Webhooks](https://support.freshdesk.com/en/support/solutions/articles/132589-using-webhooks-in-automation-rules-that-run-on-ticket-updates). Then, the Cognigy virtual agents creates the answer that fits the incoming support request and sends the message via the "Reply to Ticket" Flow Node.

## Node: Search Knowledge

Searches Freshdesk solution articles by keyword. Backed by `GET /api/v2/search/solutions`.

Fields:
- **Search Term** (required) — the keyword or phrase to search. Typically `{{input.text}}` or a slot value.
- **Category ID** (optional) — limit results to a single solution category.
- **Folder ID** (optional) — limit results to a single folder. Use this when the bot should only surface a curated subset (e.g. "Associate Information" only).
- **Max Results** (optional, default 5) — caps the number of articles returned.

Result shape stored under the configured key:

```json
{
  "articles": [
    {
      "id": 12345,
      "title": "How to Access W-2",
      "description": "<div>...</div>",
      "description_text": "...",
      "category_id": 67,
      "folder_id": 89,
      "tags": ["payroll"],
      "status": 2
    }
  ],
  "count": 1,
  "totalReturned": 1
}
```

Two child outputs:
- **On Found** — fires when one or more articles match.
- **On Not Found** — fires when the search returns no results, or the API call fails.

To find Category and Folder IDs, hit `GET /api/v2/solutions/categories` and `GET /api/v2/solutions/categories/{id}/folders`.

## Node: Get Article

Retrieves a single solution article by its **Article ID**. Backed by `GET /api/v2/solutions/articles/{id}`. Returns the full article object including HTML body, tags, status, and attachment metadata.

Pairs naturally with **Search Knowledge** for a "list → user picks → fetch full body" pattern:

1. **Search Knowledge** with the caller's question → returns up to N articles
2. Bot reads back the titles and asks which one
3. Store the chosen `articles[n].id` in context
4. **Get Article** with that ID → bot reads the full content

Two child outputs: **On Found** / **On Not Found**.
