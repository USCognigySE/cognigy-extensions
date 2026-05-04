# Contributing

Thanks for considering a contribution. This repo is a personal collection of Cognigy.AI Extensions, but PRs from other SEs and the wider community are welcome — especially for new integrations or improvements that other Cognigy users would benefit from.

## Workflow (Fork + Pull Request)

1. **Fork** this repo via the **Fork** button at the top of the [repo page](https://github.com/USCognigySE/cognigy-extensions).
2. **Clone your fork** locally and create a feature branch:
   ```bash
   git clone https://github.com/<your-handle>/cognigy-extensions.git
   cd cognigy-extensions
   git checkout -b feature/<your-extension-name>
   ```
   For bug fixes against an existing extension, use `bug/<extension-name>-<short-desc>` instead.
3. **Make your changes** following the standards below.
4. **Commit and push** to your fork:
   ```bash
   git add <files>
   git commit -m "Add <Extension>: <one-line summary>"
   git push -u origin feature/<your-extension-name>
   ```
5. **Open a Pull Request** back to `USCognigySE/cognigy-extensions:main`. The PR template will prompt you to confirm the checklist.
6. Address review comments. Once approved, your branch is merged into `main`.

If you're contributing something experimental and want feedback before doing the full polish pass, mark the PR as **Draft** — it's clear you're not asking for a final review yet.

## Standards

### Folder layout

Each extension lives in **its own folder at the repo root**, named for the integration target (e.g. `Hubspot/`, `freshdesk/`, `service-now-OAuth2/`). Inside the folder:

```
<extension-name>/
├── README.md                    required — see below
├── package.json                 with "license": "MIT"
├── tsconfig.json
├── icon.png                     64×64 PNG, used as the node icon in Cognigy.AI
├── src/
│   ├── module.ts                exports the extension
│   ├── connections/             one file per Connection type
│   └── nodes/                   one file per Node
└── <extension>.tar.gz           the built package, checked in for convenience
```

### README requirements

The folder README must cover:

- **Title and version** (`# <Name> Extension for Cognigy.AI` / `**Version: x.y.z**`)
- **One-paragraph description** of what the extension integrates
- **Connection** section listing every Connection field with notes on where to find each value
- **One `## Node:` section per Node**, listing fields, defaults, and child outputs (`On Success` / `On Error`, `On Found` / `On Not Found`, etc.)
- **Build instructions** (typically just `npm install && npm run build`)

Look at [`freshdesk/README.md`](./freshdesk/README.md) or [`Salesforce/README.md`](./Salesforce/README.md) as templates.

### Code

- TypeScript, targeting `@cognigy/extension-tools`. Match the version used by the other extensions in the repo (currently `^0.17.0` in most folders).
- No `var` declarations. Prefer `const`; `let` only when reassignment is genuinely needed.
- No hardcoded credentials, instance URLs, or customer-specific identifiers in the source. Everything tenant-specific goes through Connection or Node fields.
- Errors should be returned to the caller via the configured Input/Context key with a structured shape (`{ error: true, message, statusCode, details }`) — don't just `throw`. See `freshdesk/src/nodes/createTicket.ts` for the pattern.

### What NOT to commit

- **No customer names** anywhere — folder names, file names, sample data, commit messages, READMEs. If you're working on a customer-specific variant, keep it in a private fork.
- **No secrets** — `.env` files, API keys, OAuth client secrets, passwords. The repo `.gitignore` blocks `.env` patterns; double-check before pushing.
- **No `node_modules/`** (already gitignored).
- **No build artifacts other than the `.tar.gz`**. `dist/` and `build/` folders should not be committed; the `.tar.gz` is the only built output that lives in version control (so users can install without an `npm install`).

### Forks of upstream `Cognigy/Extensions`

If your contribution is based on an extension from [Cognigy/Extensions](https://github.com/Cognigy/Extensions), note that in your README's opening paragraph (e.g. "Fork of `Cognigy/Extensions/extensions/X` with …") so users know what's added on top. If your change would benefit the wider community, consider opening a PR upstream too — see Cognigy's [approval process](https://github.com/Cognigy/Extensions#approval-process).

## Reporting bugs / requesting features

[Open an issue](https://github.com/USCognigySE/cognigy-extensions/issues/new). Include the extension name, Cognigy.AI version, what you expected, and what happened. For feature requests against an existing extension, link to the relevant Cognigy docs or third-party API docs you're targeting.

## License

By contributing, you agree your contribution is licensed under the [MIT License](./LICENSE) — same as the rest of the repo.
