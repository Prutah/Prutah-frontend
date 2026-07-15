import express from "express";
import cors from "cors";
import * as fixtures from "./fixtures.js";

const PORT = Number(process.env.MOCK_PORT ?? 8080);
const app = express();

app.use(cors());
app.use(express.json());

// ---------- Auth ----------

app.post("/v1/auth/login", (_req, res) => {
  res.json(fixtures.session);
});

app.post("/v1/auth/api-keys", (req, res) => {
  const { label = "unnamed key", scopes = [] } = req.body ?? {};
  res.status(201).json({
    id: `key_${Math.random().toString(36).slice(2, 8)}`,
    label,
    scopes,
    key: `sk_test_${Math.random().toString(36).slice(2, 18)}`,
    created_at: new Date().toISOString(),
  });
});

// ---------- Seller ----------

app.get("/v1/endpoints", (_req, res) => {
  res.json(fixtures.endpoints);
});

app.post("/v1/endpoints", (req, res) => {
  const input = req.body ?? {};
  const endpoint = {
    id: `ep_${fixtures.endpoints.length + 1}`,
    path: input.path,
    price: input.price,
    asset: input.asset ?? "USDC",
    free_tier: input.free_tier ?? { enabled: false },
    created_at: new Date().toISOString(),
  };
  fixtures.endpoints.push(endpoint);
  res.status(201).json(endpoint);
});

app.patch("/v1/endpoints/:id", (req, res) => {
  const endpoint = fixtures.endpoints.find((e) => e.id === req.params.id);
  if (!endpoint) return res.status(404).json({ error: "not found" });
  Object.assign(endpoint, req.body ?? {});
  res.json(endpoint);
});

app.get("/v1/revenue", (_req, res) => {
  res.json(fixtures.revenueDaily);
});

app.get("/v1/payments", (req, res) => {
  const { endpoint, payer, page = "1", page_size = "20" } = req.query as Record<string, string>;
  let items = fixtures.payments;
  if (endpoint) items = items.filter((p) => p.endpoint_id === endpoint);
  if (payer) items = items.filter((p) => p.payer === payer);

  const pageNum = Number(page);
  const pageSize = Number(page_size);
  const start = (pageNum - 1) * pageSize;

  res.json({
    items: items.slice(start, start + pageSize),
    total: items.length,
    page: pageNum,
    page_size: pageSize,
  });
});

app.get("/v1/payouts", (_req, res) => {
  res.json(fixtures.payouts);
});

app.put("/v1/payouts/address", (req, res) => {
  const { address } = req.body ?? {};
  if (address) fixtures.payouts.address = address;
  res.json(fixtures.payouts);
});

// ---------- Payer ----------

app.get("/v1/policies", (_req, res) => {
  res.json(fixtures.policies);
});

app.post("/v1/policies", (req, res) => {
  const input = req.body ?? {};
  const policy = {
    id: `pol_${fixtures.policies.length + 1}`,
    name: input.name,
    rule: input.rule,
    status: "draft",
    contract_id: null,
    tx_hash: null,
    created_at: new Date().toISOString(),
  };
  fixtures.policies.push(policy);
  res.status(201).json(policy);
});

app.post("/v1/policies/:id/deployed", (req, res) => {
  const policy = fixtures.policies.find((p) => p.id === req.params.id);
  if (!policy) return res.status(404).json({ error: "not found" });
  const { contract_id, tx_hash } = req.body ?? {};
  policy.status = "active";
  policy.contract_id = contract_id ?? policy.contract_id;
  policy.tx_hash = tx_hash ?? policy.tx_hash;
  res.json(policy);
});

app.get("/v1/agents", (_req, res) => {
  res.json(fixtures.agents);
});

app.post("/v1/agents", (req, res) => {
  const input = req.body ?? {};
  const agent = {
    id: `agt_${fixtures.agents.length + 1}`,
    name: input.name,
    public_key: input.public_key,
    policy_id: input.policy_id,
    status: "active",
    created_at: new Date().toISOString(),
  };
  fixtures.agents.push(agent);
  res.status(201).json(agent);
});

app.post("/v1/agents/:id/pause", (req, res) => {
  const agent = fixtures.agents.find((a) => a.id === req.params.id);
  if (!agent) return res.status(404).json({ error: "not found" });
  agent.status = agent.status === "paused" ? "active" : "paused";
  res.json(agent);
});

app.get("/v1/spend", (req, res) => {
  const { agent } = req.query as Record<string, string>;
  const items = agent ? fixtures.spendEvents.filter((s) => s.agent_id === agent) : fixtures.spendEvents;
  res.json(items);
});

app.get("/v1/audit", (req, res) => {
  const { agent, decision, page = "1", page_size = "20" } = req.query as Record<string, string>;
  let items = fixtures.auditEntries;
  if (agent) items = items.filter((a) => a.agent_id === agent);
  if (decision) items = items.filter((a) => a.decision === decision);

  const pageNum = Number(page);
  const pageSize = Number(page_size);
  const start = (pageNum - 1) * pageSize;

  res.json({
    items: items.slice(start, start + pageSize),
    total: items.length,
    page: pageNum,
    page_size: pageSize,
  });
});

// ---------- Alerts ----------

app.get("/v1/alerts", (_req, res) => {
  res.json(fixtures.alertRules);
});

app.post("/v1/alerts", (req, res) => {
  const input = req.body ?? {};
  const rule = {
    id: `alert_${fixtures.alertRules.length + 1}`,
    kind: input.kind,
    threshold_pct: input.threshold_pct,
    agent_id: input.agent_id ?? null,
    enabled: true,
  };
  fixtures.alertRules.push(rule);
  res.status(201).json(rule);
});

app.put("/v1/alerts/webhooks", (req, res) => {
  Object.assign(fixtures.webhookConfig, req.body ?? {});
  res.json(fixtures.webhookConfig);
});

// ---------- Shared ----------

app.get("/v1/org", (_req, res) => {
  res.json(fixtures.org);
});

app.get("/v1/overview", (_req, res) => {
  res.json(fixtures.overview);
});

// ---------- SSE streams ----------

function sseHandler<T>(seedEvents: T[], makeEvent: (tick: number) => T) {
  return (_req: express.Request, res: express.Response) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    res.flushHeaders();

    // Replay a handful of recent events immediately so the UI isn't empty.
    seedEvents.slice(0, 5).forEach((event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    });

    let tick = 0;
    const interval = setInterval(() => {
      res.write(`data: ${JSON.stringify(makeEvent(tick++))}\n\n`);
    }, 4000);

    _req.on("close", () => clearInterval(interval));
  };
}

app.get(
  "/v1/stream/spend",
  sseHandler(fixtures.spendEvents, (tick) => {
    const agent = fixtures.agents[tick % fixtures.agents.length];
    return {
      id: `spend_live_${tick}`,
      agent_id: agent.id,
      agent_name: agent.name,
      merchant: ["api.openai.com", "api.anthropic.com", "search.brave.com"][tick % 3],
      amount: (0.01 + (tick % 5) * 0.02).toFixed(2),
      currency: "USDC",
      budget_consumed_pct: Math.min(99, 20 + tick * 4),
      created_at: new Date().toISOString(),
    };
  }),
);

app.get(
  "/v1/stream/alerts",
  sseHandler([], (tick) => {
    const agent = fixtures.agents[tick % fixtures.agents.length];
    return {
      id: `alert_live_${tick}`,
      rule_id: fixtures.alertRules[tick % fixtures.alertRules.length].id,
      agent_id: agent.id,
      agent_name: agent.name,
      severity: tick % 3 === 0 ? "critical" : tick % 3 === 1 ? "warning" : "info",
      message: `${agent.name} crossed ${20 + tick * 5}% of its monthly budget`,
      created_at: new Date().toISOString(),
    };
  }),
);

app.listen(PORT, () => {
  console.log(`[mock] Prutah backend mock listening on http://localhost:${PORT}`);
});
