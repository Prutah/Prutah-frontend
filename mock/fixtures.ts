// Realistic fixtures for every route in the backend API interface.
// Kept in sync with src/types — if the interface changes, update both.

export const org = {
  id: "org_prutah",
  name: "Prutah Labs",
  roles: ["seller", "payer"],
  network: "testnet",
  members: [
    { id: "mem_1", name: "Favour Ejiro", email: "favoursejiro@gmail.com", role: "admin" },
    { id: "mem_2", name: "Adaeze Okonkwo", email: "adaeze@prutah.dev", role: "viewer" },
  ],
};

export const session = {
  token: "mock-session-token",
  org: { id: org.id, name: org.name },
  member: org.members[0],
};

export const endpoints = [
  {
    id: "ep_1",
    path: "/v1/weather/forecast",
    price: "0.01",
    asset: "USDC",
    free_tier: { enabled: true, calls_per_period: 100, period: "day" },
    created_at: "2026-05-01T09:00:00Z",
  },
  {
    id: "ep_2",
    path: "/v1/llm/embeddings",
    price: "0.05",
    asset: "USDC",
    free_tier: { enabled: false },
    created_at: "2026-05-10T14:30:00Z",
  },
  {
    id: "ep_3",
    path: "/v1/search/web",
    price: "0.02",
    asset: "USDC",
    free_tier: { enabled: true, calls_per_period: 20, period: "day" },
    created_at: "2026-06-02T11:15:00Z",
  },
];

const payers = [
  "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
  "GA7QYNF7SOWQ3GLR2BGMZEHXAVIRZA4KVWLTJJFC7MGXUA74P7UJVSGZ",
  "GDQP2KPQGKIHYJGXNUIYOMHARUARCA7DJT5FO2FFOOKY3B2WSQHG4W37",
];

function txHash(seed: number) {
  return Array.from({ length: 64 }, (_, i) => ((seed * 9301 + i * 49297) % 16).toString(16)).join("");
}

export const payments = Array.from({ length: 42 }, (_, i) => {
  const endpoint = endpoints[i % endpoints.length];
  const status = i % 11 === 0 ? "abandoned" : i % 5 === 0 ? "issued" : "paid";
  return {
    id: `pay_${i + 1}`,
    endpoint_id: endpoint.id,
    endpoint_path: endpoint.path,
    payer: payers[i % payers.length],
    amount: endpoint.price,
    currency: "USDC",
    status,
    tx_hash: status === "paid" ? txHash(i) : null,
    created_at: new Date(Date.UTC(2026, 6, 1 + (i % 14), 8 + (i % 12), (i * 7) % 60)).toISOString(),
  };
});

export const revenueDaily = Array.from({ length: 14 }, (_, i) => ({
  bucket: new Date(Date.UTC(2026, 6, 1 + i)).toISOString().slice(0, 10),
  amount: (Math.round((3 + Math.sin(i / 2) * 2 + i * 0.4) * 100) / 100).toFixed(2),
  currency: "USDC",
}));

export const payouts = {
  address: "GBRPYHIL2CI3FNQ4BXLFMNDLFJUNPU2HY3ZMFSHONUCEOASW7QC7OX2H",
  batches: [
    { id: "batch_1", amount: "128.40", currency: "USDC", status: "settled", settled_at: "2026-07-08T00:00:00Z", tx_hash: txHash(101) },
    { id: "batch_2", amount: "94.10", currency: "USDC", status: "settled", settled_at: "2026-07-01T00:00:00Z", tx_hash: txHash(102) },
    { id: "batch_3", amount: "41.75", currency: "USDC", status: "pending", settled_at: null, tx_hash: null },
  ],
};

export const policies = [
  {
    id: "pol_1",
    name: "Research agent — conservative",
    rule: {
      budget_per_period: { amount: "50", period: "month" },
      max_per_transaction: "0.10",
      merchant_allowlist: ["*.openai.com", "*.anthropic.com"],
      merchant_denylist: [],
    },
    status: "active",
    contract_id: "CCPOLICY1XYZ",
    tx_hash: txHash(201),
    created_at: "2026-05-15T10:00:00Z",
  },
  {
    id: "pol_2",
    name: "Scraper agent — wide allowlist",
    rule: {
      budget_per_period: { amount: "200", period: "month" },
      max_per_transaction: "1.00",
      merchant_allowlist: [],
      merchant_denylist: ["*.knownbad.io"],
    },
    status: "active",
    contract_id: "CCPOLICY2XYZ",
    tx_hash: txHash(202),
    created_at: "2026-06-01T10:00:00Z",
  },
  {
    id: "pol_3",
    name: "Draft — image gen agent",
    rule: {
      budget_per_period: { amount: "20", period: "week" },
      max_per_transaction: "0.50",
      merchant_allowlist: ["*.stability.ai"],
      merchant_denylist: [],
    },
    status: "draft",
    contract_id: null,
    tx_hash: null,
    created_at: "2026-07-10T10:00:00Z",
  },
];

export const agents = [
  { id: "agt_1", name: "agent-research", public_key: "GABC...RESEARCH", policy_id: "pol_1", status: "active", created_at: "2026-05-15T10:05:00Z" },
  { id: "agt_2", name: "agent-scraper", public_key: "GABC...SCRAPER", policy_id: "pol_2", status: "active", created_at: "2026-06-01T10:05:00Z" },
  { id: "agt_3", name: "agent-x", public_key: "GABC...AGENTX", policy_id: "pol_2", status: "paused", created_at: "2026-06-20T10:05:00Z" },
];

const merchants = ["api.openai.com", "api.anthropic.com", "search.brave.com", "unknownvendor.io"];

export const spendEvents = Array.from({ length: 30 }, (_, i) => {
  const agent = agents[i % agents.length];
  return {
    id: `spend_${i + 1}`,
    agent_id: agent.id,
    agent_name: agent.name,
    merchant: merchants[i % merchants.length],
    amount: (0.01 + (i % 7) * 0.03).toFixed(2),
    currency: "USDC",
    budget_consumed_pct: Math.min(96, 10 + i * 3),
    created_at: new Date(Date.UTC(2026, 6, 10 + (i % 5), 6 + i, 0)).toISOString(),
  };
});

export const auditEntries = Array.from({ length: 36 }, (_, i) => {
  const agent = agents[i % agents.length];
  const refused = i % 6 === 0;
  return {
    id: `audit_${i + 1}`,
    agent_id: agent.id,
    agent_name: agent.name,
    decision: refused ? "refused" : "allowed",
    reason: refused
      ? i % 2 === 0
        ? "merchant not in allowlist"
        : "exceeds max per-transaction cap"
      : "within policy",
    merchant: merchants[i % merchants.length],
    amount: (0.01 + (i % 5) * 0.02).toFixed(2),
    tx_hash: refused ? null : txHash(300 + i),
    created_at: new Date(Date.UTC(2026, 6, 9 + (i % 6), 5 + i, 0)).toISOString(),
  };
});

export const alertRules = [
  { id: "alert_1", kind: "budget_threshold", threshold_pct: 80, agent_id: null, enabled: true },
  { id: "alert_2", kind: "budget_threshold", threshold_pct: 100, agent_id: null, enabled: true },
  { id: "alert_3", kind: "unusual_merchant", agent_id: "agt_3", enabled: true },
];

export const webhookConfig = {
  url: "https://hooks.prutah.dev/alerts",
  email: "favoursejiro@gmail.com",
};

export const overview = {
  revenue_in: { amount: "264.25", currency: "USDC", delta_pct: 12.4 },
  spend_out: { amount: "88.90", currency: "USDC", delta_pct: -3.1 },
  active_agents: agents.filter((a) => a.status === "active").length,
  active_endpoints: endpoints.length,
  network: "testnet",
};
