# Prutah-frontend

The web dashboard for Prutah — the full x402 agent-payments stack on Stellar. One frontend, two views: a **seller view** for API developers monetizing endpoints (pricing, revenue, payment history) and a **payer view** for teams running AI agents (spending policies, live spend, audit trails). One org, one login, both sides of the x402 flow.

Part of the Prutah org. Sibling repos: `core` (shared x402 payment primitives) · `contracts` (Soroban policy engine) · `payer-sdk` · `seller-kit` · `backend` (facilitator + indexer, the API this dashboard consumes). This README is self-contained: everything needed to build this repo is below, including the exact backend API interface it consumes.

## What This Repo Is

Prutah's primary users interact in code — agents pay through `payer-sdk`, APIs charge through `seller-kit`. The dashboard is where the humans behind them configure, monitor, and audit that activity. It is a control-and-monitoring surface, not the product itself — which shapes every design decision below: dense information display, zero onboarding friction for developers, and nothing that blocks the SDK flows.

It is deliberately thin. All money movement happens on Stellar via the backend and contracts; all policy enforcement happens on-chain. The dashboard reads state, submits configuration, and never holds funds or signs agent payments. If the dashboard is down, payments and policies keep working.

## The Two Views

### Seller view — "I monetize APIs"

| Surface | What it does |
|---|---|
| Endpoints | Register API endpoints, set per-call price (USDC), currency, and free-tier rules; generates the seller-kit config snippet to paste into your middleware |
| Revenue | Live and historical earnings: per-endpoint, per-payer, per-day charts; settlement status on Stellar; CSV export |
| Payments | Searchable payment log — every 402 challenge issued, paid, or abandoned, with the on-chain transaction link |
| Payouts | Configure the receiving Stellar address, view settlement batches |

### Payer view — "I run agents that spend"

| Surface | What it does |
|---|---|
| Policies | Create/edit spending policies backed by the on-chain policy contracts: per-period budgets, merchant allowlists/denylists, per-transaction caps; deploy and revoke with wallet signature |
| Agents | Register agent identities (keys), bind each to a policy, pause/kill-switch an agent instantly |
| Live spend | Real-time spend feed per agent with budget-consumption bars ("agent-x: 82% of monthly budget"), streamed via SSE |
| Audit trail | Every policy decision — payments allowed, payments refused and why — filterable, exportable, with on-chain references for allowed payments |
| Alerts | Threshold alerts (80%/100% budget), unusual-merchant alerts, webhook + email delivery config |

### Shared surfaces

- **Org & members** — one organization can hold both roles; members with viewer/admin permissions
- **Overview home** — combined snapshot: revenue in, spend out, active agents, active endpoints
- **Settings** — API keys for the backend, webhook endpoints, network selector (testnet/mainnet)

## Stack

- React 19 + TypeScript + Vite — SPA, static-deployable
- TailwindCSS v4 — with a small shared component set (tables, stat cards, charts) in `src/components/ui`
- Recharts — revenue/spend visualizations
- TanStack Query — all server state; SSE for live feeds
- Freighter wallet integration (`src/lib/wallet.ts`) — used only where a human signature is required: deploying/updating/revoking policy contracts and setting payout addresses. Everything else is session-auth against the backend
- No global state library — server state lives in TanStack Query, UI state in component state; introduce Zustand only if a real cross-cutting need appears (documented decision, revisit at M4)

## Backend API Interface (consumed)

> ⚠️ **Integration contract.** This section is copy-mirrored from the backend repo README. If you change an endpoint there, update it here in the same PR. The API client in `src/api/` is built from exactly these routes.

```
# Auth
POST /v1/auth/login                     → session token (org member)
POST /v1/auth/api-keys                  → create scoped API key

# Seller
GET    /v1/endpoints                    → registered endpoints + pricing
POST   /v1/endpoints                    → register endpoint {path, price, asset, free_tier}
PATCH  /v1/endpoints/{id}               → update pricing/rules
GET    /v1/revenue?from=&to=&group_by=  → aggregated revenue series
GET    /v1/payments?endpoint=&payer=    → paginated payment log (incl. tx_hash)
GET    /v1/payouts                      → settlement batches + receiving address
PUT    /v1/payouts/address              → set payout address (wallet-signed challenge)

# Payer
GET    /v1/policies                     → policies + on-chain contract refs
POST   /v1/policies                     → draft policy (deployment is wallet-signed, client-side)
POST   /v1/policies/{id}/deployed       → confirm on-chain deployment {contract_id, tx_hash}
GET    /v1/agents                       → registered agents + bound policies
POST   /v1/agents                       → register agent {name, public_key, policy_id}
POST   /v1/agents/{id}/pause            → kill switch
GET    /v1/spend?agent=&from=&to=       → spend history + budget consumption
GET    /v1/audit?agent=&decision=       → policy decision log (allowed/refused + reason)
SSE    /v1/stream/spend                 → live spend events
SSE    /v1/stream/alerts                → live alert events

# Alerts
GET/POST /v1/alerts                     → alert rules
PUT      /v1/alerts/webhooks            → webhook config

# Shared
GET    /v1/org                          → org profile, members, roles
GET    /v1/overview                     → combined home-page stats
```

**Contract interaction (via Freighter, not the backend):** the dashboard builds and submits three Soroban transactions client-side — `policy.deploy(params)`, `policy.update(params)`, `policy.revoke()` — using contract bindings imported from the `contracts` repo's generated TypeScript package. The backend is notified of deployments; it never signs them. `src/lib/contracts.ts` stands in for that generated client until it's wired in — see the comment at the top of that file.

## Key User Flows

1. **Seller onboarding** (target: under 10 minutes to first paid call) — create org → register endpoint + price → copy generated seller-kit snippet → dashboard detects first incoming payment and celebrates it. The time-to-first-revenue metric is the product's north star and gets a progress UI of its own.
2. **Policy creation** — form-driven policy builder with plain-language preview ("agent-x may spend up to 50 USDC/month, only at `*.openai.com` and `*.anthropic.com`, max 0.10 USDC per call") → Freighter signature → on-chain deployment → policy live.
3. **Incident response** — alert fires → payer opens live spend → one-click pause agent → audit trail shows exactly which calls were made and which the policy refused. This flow is rehearsed in the demo environment because it is the security story reviewers will test.

## Design Decisions

- **Read-heavy, write-light**: the dashboard's job is clarity, not workflow. Dense tables with real numbers beat wizards. Developers are the audience; respect that.
- **Refusals are first-class data.** Most spend dashboards show what was spent; Prutah's audit trail equally shows what the policy blocked and why — that's the evidence the policy engine works, and it's the screenshot that sells the project.
- **Both views, one nav.** Roles are capabilities, not modes: an org that only sells sees only seller surfaces; an org doing both gets both without switching accounts. No artificial "seller product vs payer product" wall.
- **Static-deployable, self-hostable**: no SSR dependency; any org can host their own dashboard against their self-hosted backend.
- **Testnet-first UX**: network selector is prominent, testnet data is visually watermarked, and nothing about the UI assumes mainnet — this project will live on testnet for months and the dashboard should feel first-class there.

## Development Setup

```bash
npm install
cp .env.example .env        # set VITE_API_URL (default: http://localhost:8080)
npm run dev                 # starts against local backend

# With the mock server (no backend needed — fixtures for every endpoint above)
npm run dev:mock

# Quality gates (CI runs all four)
npm run lint && npm run typecheck && npm test && npm run build
```

The mock server (`/mock`) implements the full API interface with realistic fixtures — including the two SSE streams — so frontend contributors never need to run the Rust backend or a Stellar node. Keeping mocks in sync with the interface section above is part of any PR that touches the API client.

### Project layout

```
src/
  api/         typed client + one module per resource area (auth, seller, payer, alerts, shared), SSE helper
  components/  ui/ (shared primitives) and charts/ (Recharts wrappers), layout/ (AppShell + nav)
  hooks/       TanStack Query hooks (queries.ts) and SSE hooks (useStream.ts)
  lib/         wallet.ts (Freighter), contracts.ts (Soroban policy bindings), network/csv/explorer helpers
  pages/       seller/, payer/, shared/ — one file per surface in the tables above
  types/       domain types mirroring the backend API interface
mock/          Express mock server + fixtures implementing every route above
```

## Contributing

- 🟢 `dashboard/good-first-issue` — component-level work: stat cards, table filters, empty states, i18n strings
- 🟡 `dashboard/help-wanted` — charts, CSV export, alert rule builder, accessibility passes
- 🔴 `dashboard/core` — policy builder ↔ contract bindings, SSE handling, auth/session model

Every issue carries acceptance criteria and, where relevant, a fixture in the mock server to build against. PRs that change any consumed endpoint must link the corresponding backend repo PR — the interface section in this README is the integration contract, and drift between the two repos is treated as a bug.

See `CONTRIBUTING.md` for component conventions and the PR checklist.

## Roadmap (dashboard-scoped)

| Milestone | Scope |
|---|---|
| D1 | Seller view MVP: endpoints, payments log, revenue basics — against mock server |
| D2 | Live backend integration + org/auth + overview home |
| D3 | Payer view: policy builder + Freighter deployment + agents |
| D4 | Live spend SSE, audit trail, alerts |
| D5 | Payouts, CSV exports, self-hosting docs, accessibility audit |

## License

Apache-2.0

---

Prutah dashboard: watch the money both ways.
