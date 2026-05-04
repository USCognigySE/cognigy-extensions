# Cognigy.AI Extensions

A collection of community-contributed [Cognigy.AI](https://www.cognigy.com/product/) Extensions — JavaScript modules exposed as [Flow Nodes](https://docs.cognigy.com/ai/build/node-reference/overview/) that integrate Cognigy.AI with third-party systems.

This repository is **not an official Cognigy product** — it is a personal collection of Extensions built for customer POCs and demos by a Cognigy Presales Solutions Engineer. Where an Extension overlaps in name with one in the official [Cognigy/Extensions](https://github.com/Cognigy/Extensions) repo, it is a fork with modifications (additional fields, alternate auth, bug fixes). Use the official repo as your default; reach for these when you need a specific behavior that the official version doesn't cover.

## Contents

| Extension | What it does |
|---|---|
| [Hubspot](./Hubspot/) | HubSpot CRM integration — contacts, companies, deals, engagements, and entity search via the official `@hubspot/api-client`. Comprehensive: 570-line README, 4.2.0. |
| [OKTA](./OKTA/) | OAuth2 Client Credentials token retrieval against Okta, with cross-session token caching designed for REST-endpoint token-service patterns. |
| [Salesforce](./Salesforce/) | Salesforce integration via [jsforce](https://jsforce.github.io/) — Cases, Contacts, generic SOQL query, and arbitrary entity CRUD. OAuth2 connection. Replaces the deprecated "Salesforce CRM" extension. |
| [freshdesk](./freshdesk/) | Freshdesk ticketing — Create / Get / Update / Filter / Reply, plus Solutions article search and retrieval. Includes an `additionalFields` JSON pass-through on Create Ticket for tenants with strict required-field rules (type, group, custom fields). |
| [service-now-OAuth2](./service-now-OAuth2/) | ServiceNow integration over OAuth 2.0 (Password Grant) — Incidents, Service Catalog, Knowledge, Email. Replaces HTTP Basic auth from the upstream extension. |
| [service-now-partial-match](./service-now-partial-match/) | Same as service-now-OAuth2 but with fuzzy / partial-match lookup behavior on entity searches (work orders etc.) — useful where exact match fails too often. |

Each extension folder has its own README with connection setup, node-by-node field reference, and (where present) a packaged `.tar.gz` ready to upload.

## Installing an Extension into Cognigy.AI

1. From the relevant extension folder, run `npm install && npm run build` to produce a `.tar.gz` (or use the pre-built one if shipped).
2. In Cognigy.AI, go to **Manage → Extensions → Upload Extension** and pick the `.tar.gz`.
3. Open a Flow, drag the new node, fill in fields (and create a Connection if the node requires one).
4. See [Cognigy's Get Started guide](https://support.cognigy.com/hc/en-us/articles/360016534459) for screenshots.

For Cognigy.AI version compatibility and Connection types, refer to the README inside each extension folder.

## Building from source

All extensions follow the standard Cognigy build:

```bash
cd <extension-folder>
npm install
npm run build      # transpile + tar
```

Output is a `.tar.gz` in the folder, ready to upload via **Manage → Extensions**.

Each folder has an `icon.png` (64×64) used as the node icon in Cognigy.AI; replace it before building if you want a different icon.

## Forks vs new

| Extension | Origin |
|---|---|
| Hubspot | New (built from scratch on top of `@hubspot/api-client`) |
| OKTA | New |
| Salesforce | Fork of [Cognigy/Extensions/extensions/salesforce](https://github.com/Cognigy/Extensions/tree/master/extensions/salesforce) with significant modifications |
| freshdesk | Fork of [Cognigy/Extensions/extensions/freshdesk](https://github.com/Cognigy/Extensions/tree/master/extensions/freshdesk) — added `additionalFields` JSON pass-through, Solutions article search and retrieval |
| service-now-OAuth2 | Fork of [Cognigy/Extensions/extensions/service-now](https://github.com/Cognigy/Extensions/tree/master/extensions/service-now) — switched from Basic to OAuth2 Password Grant |
| service-now-partial-match | Variant of service-now-OAuth2 with partial-match lookup |

## Contributing

PRs are welcome. The workflow (fork → branch → PR), folder structure, README requirements, and code conventions are all documented in **[CONTRIBUTING.md](./CONTRIBUTING.md)**. A PR template is provided to walk through the checklist on submission.

If a change here would also benefit the wider Cognigy community, consider opening a parallel PR against [Cognigy/Extensions](https://github.com/Cognigy/Extensions) — see their [approval process](https://github.com/Cognigy/Extensions#approval-process).

## License

[MIT](./LICENSE). You are subject to the terms of the third-party providers (Freshdesk, Salesforce, ServiceNow, HubSpot, Okta) that you connect to. Cognigy and the author take no responsibility for your use of those services.
