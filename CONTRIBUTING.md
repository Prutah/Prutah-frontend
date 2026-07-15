# Contributing to Prutah-frontend

## Getting set up

```bash
npm install
cp .env.example .env
npm run dev:mock   # dashboard + mock backend, no Rust/Stellar node needed
```

Quality gates (CI runs all four — run them before opening a PR):

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Component conventions

- Shared, reusable primitives (tables, cards, badges, buttons, form controls) live in `src/components/ui/`. Chart wrappers live in `src/components/charts/`. Page-specific composition lives under `src/pages/<seller|payer|shared>/`.
- One page per surface described in the README's view tables — don't split a surface across multiple route files, and don't merge two surfaces into one.
- Server state goes through TanStack Query hooks in `src/hooks/queries.ts` (query keys live in the exported `qk` object — reuse them for invalidation instead of hand-rolling key arrays). Live/streamed state goes through `src/hooks/useStream.ts`.
- UI state (form inputs, filters, modals) stays in component state. Don't reach for a global store — see the "no global state library" decision in the README; if you hit a genuine cross-cutting need, raise it before adding one.
- Tailwind for styling; use the `--color-*` design tokens defined in `src/index.css` (`@theme`) rather than hardcoding hex values, so light/dark and brand-color changes stay centralized.

## Working against the API interface

- `src/types/index.ts` and `src/api/*.ts` mirror the "Backend API Interface" section of the README exactly. If your change adds, removes, or reshapes an endpoint:
  1. Update the README's interface block.
  2. Update the matching type(s) in `src/types`.
  3. Update the matching function(s) in `src/api`.
  4. Update or add a fixture/route in `mock/fixtures.ts` and `mock/server.ts`.
  5. Link the corresponding `backend` repo PR in your PR description — drift between the two repos is treated as a bug.
- Every new query needs a query key in `qk` (`src/hooks/queries.ts`) and a hook alongside the existing ones.

## Freighter / Soroban work

- Wallet interaction goes through `src/lib/wallet.ts` — don't call `@stellar/freighter-api` directly from page components.
- Contract calls (`policy.deploy` / `update` / `revoke`) go through `src/lib/contracts.ts`. That file is a placeholder until the `contracts` repo's generated TypeScript client is wired in; if you're doing that integration, replace the function bodies there and keep the exported shape stable so call sites don't need to change.

## PR checklist

- [ ] `npm run lint && npm run typecheck && npm test && npm run build` all pass
- [ ] If you touched a consumed endpoint: README interface block, types, API client, and mock server are all updated together, and the backend PR is linked
- [ ] New UI states (loading, empty, error) are handled — use `EmptyState` for empty tables rather than a blank page
- [ ] Testnet vs mainnet behavior wasn't assumed — check `getConfiguredNetwork()` / the org's `network` field where relevant
- [ ] No secrets, API keys, or `.env` values committed

## Issue labels

- 🟢 `dashboard/good-first-issue` — component-level work
- 🟡 `dashboard/help-wanted` — charts, CSV export, alert rule builder, accessibility passes
- 🔴 `dashboard/core` — policy builder ↔ contract bindings, SSE handling, auth/session model
