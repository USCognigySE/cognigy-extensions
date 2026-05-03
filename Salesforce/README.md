# Salesforce

**Version: 4.3.0**

Integrates Cognigy.AI with [Salesforce](https://www.salesforce.com). Communicates with the Salesforce REST API using `api.httpRequest`. This is a fork of the [official Cognigy Salesforce Extension](https://github.com/Cognigy/Extensions/tree/master/extensions/salesforce) with additional fields and behaviors layered on top.

> **WARNING** This Extension is a replacement for the deprecated "Salesforce CRM" Extension. The old Connections cannot be used anymore — updating involves migrating from the old Extension. If you still need the old "Salesforce CRM" version, see the upstream [salesforce-crm 4.2.3 release](https://github.com/Cognigy/Extensions/releases/tag/salesforce-crm423).

## Connection: Salesforce Connected App (OAuth2)

| Field | Notes |
|---|---|
| `consumerKey` | Consumer Key from your Salesforce Connected App |
| `consumerSecret` | Consumer Secret from your Salesforce Connected App. Mark as **secret**. |
| `instanceUrl` | Instance URL, e.g. `https://acme.my.salesforce.com` |

Every node call exchanges these credentials for an OAuth access token at `POST {instanceUrl}/services/oauth2/token` using the **Client Credentials grant** and uses the token as a bearer for the request.

### Creating the Connected App

Follow Salesforce's [Configure a Connected App for Client Credentials Flow](https://help.salesforce.com/s/articleView?id=sf.connected_app_client_credentials_setup.htm&type=5) guide. The Consumer Key and Consumer Secret produced there are what go into the Cognigy Connection.

## Node: Create Case

Creates a Salesforce Case with:
- **Status** — dynamic dropdown populated from `CaseStatus` on your org (the node queries Salesforce when the field is opened, so you only see valid statuses).
- **Origin** — the `Origin` picklist value.
- **Subject** — short summary line.
- **Description** — full case body.
- **Additional Case Details** *(JSON object)* — merged into the Case payload before submission. Use it to set fields not exposed as form inputs (e.g. `Priority`, `AccountId`, `ContactId`, `OwnerId`, `RecordTypeId`, custom `__c` fields). Form fields above take precedence over keys in this object.

The created Case object (including `Id` and `CaseNumber`) is stored under the configured Input/Context key.

Two child outputs: **On Success** / **On Error**.

## Node: Get Case

Retrieves a Case by **Case ID** (Salesforce 15- or 18-character ID, or `CaseNumber`). The full Case record is stored under the configured Input/Context key.

Two child outputs: **On Success** / **On Error**.

## Node: Search Contact

Searches for a Contact by name, email, or phone. Returns the matching record(s) under the configured Input/Context key.

Two child outputs: **On Found** / **On Not Found**.

## Node: Query

Runs an arbitrary [SOQL](https://developer.salesforce.com/docs/atlas.en-us.soql_sosl.meta/soql_sosl/sforce_api_calls_soql.htm) query against the org and returns the records under the configured Input/Context key.

| Field | Notes |
|---|---|
| **Salesforce Object Query (SOQL)** | The SOQL string. Default: `SELECT Id, Name FROM Contact WHERE Name LIKE 'J%'`. Supports Cognigy interpolation (`{{...}}`). |
| **Maximum separate fetches** | How many paginated round-trips the node will make before stopping. Caps result-set size and latency on broad queries. Default: 8. |

Two child outputs: **On Found** / **On Empty Results**.

## Node: Entity Request

Generic CRUD against any Salesforce entity — useful for objects without a dedicated node.

| Field | Notes |
|---|---|
| **Request Type** | `create`, `retrieve`, `update`, or `delete` |
| **Entity Type** | The Salesforce SObject API name (`Account`, `Lead`, `Custom_Thing__c`, etc.). Dynamic dropdown populated from `EntityDefinition`. |
| **Entity Record** *(JSON, create/update only)* | Field/value pairs to write |
| **Entity ID** *(retrieve/update/delete only)* | The 15- or 18-character record ID |
| **API Version** | Salesforce REST API version, e.g. `v56.0` |

Two child outputs: **On Success** / **On Error**.

## Build

```bash
npm install
npm run build
```

Produces `salesforce.tar.gz` ready to upload via **Manage → Extensions** in Cognigy.AI.

## Repo layout

```
Salesforce/
├── README.md
├── icon.png
├── package.json
├── tsconfig.json
├── tslint.json
└── src/
    ├── module.ts
    ├── authenticate.ts                OAuth client_credentials token fetch
    ├── connections/
    │   └── oauth.ts
    └── nodes/
        ├── createCase.ts
        ├── getCase.ts
        ├── searchContact.ts
        ├── query.ts
        └── entityRequest.ts
```
