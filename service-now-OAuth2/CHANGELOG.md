# Changelog

## 5.0.0

**Breaking change — authentication moved from HTTP Basic Auth to OAuth 2.0 (Password Grant).**

Existing `snow` connections from 4.x will no longer authenticate. Open each connection and populate the two new fields (`clientId`, `clientSecret`); see the [README](./README.md#connection) for setup steps.

### Changed
- `snowConnection` schema now has five fields (`instance`, `clientId`, `clientSecret`, `username`, `password`) instead of three. Connection label is now `Service Now Connection (OAuth Password Grant)`.
- All HTTP-calling nodes fetch a fresh OAuth token at function start via `POST {instance}/oauth_token.do` (grant_type=password) and send the access token as `Authorization: Bearer …`. The previous `auth: { username, password }` HTTP Basic Auth is removed.
- Instance URLs are normalised before use: a bare hostname (`mycompany.service-now.com`) is auto-prefixed with `https://`, and trailing slashes are stripped.
- Node ordering in the extension preview reorganised so each parent node is followed inline by its `On Success` / `On Error` children.

### Added
- `src/lib/snowAuth.ts` — shared OAuth helper used by every node (`getSnowAuth`, `normaliseInstanceUrl`, `ISnowConnection`).
- README section: "Creating the OAuth client in ServiceNow".
- README sections for previously undocumented nodes: `Find Ticket in Text`, `Get Service Catalogs`, `Get Service Catalog Details`, `Get Service Catalog Items`, `Add to Cart`, `Order Item Now`, `Search Articles (Knowledge)`.

### Migration

1. In ServiceNow, register an OAuth API endpoint for external clients (System OAuth → Application Registry → New → "Create an OAuth API endpoint for external clients"). Note the generated Client ID and Client Secret.
2. In Cognigy, edit each existing `Service Now Connection`. The connection editor will now show three additional fields (`clientId`, `clientSecret`, plus the unchanged `instance`/`username`/`password`). All five values must be re-entered, because Cognigy connection fields are write-only.
3. No flow changes are required — node configuration, inputs, and result shapes are unchanged.

## 4.2.0 and earlier

See git history.
