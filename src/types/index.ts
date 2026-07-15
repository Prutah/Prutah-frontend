// Core domain types mirroring the backend API interface (see README's
// "Backend API Interface" section — this file must stay in sync with it).

export type Role = "seller" | "payer";
export type MemberRole = "viewer" | "admin";
export type Network = "testnet" | "mainnet";

export interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
}

export interface Org {
  id: string;
  name: string;
  roles: Role[];
  network: Network;
  members: OrgMember[];
}

export interface AuthSession {
  token: string;
  org: Pick<Org, "id" | "name">;
  member: OrgMember;
}

// ---------- Seller ----------

export interface Endpoint {
  id: string;
  path: string;
  price: string; // decimal string, USDC
  asset: string;
  free_tier: {
    enabled: boolean;
    calls_per_period?: number;
    period?: "day" | "month";
  };
  created_at: string;
}

export interface RevenuePoint {
  bucket: string; // ISO date/time bucket
  amount: string;
  currency: string;
}

export type PaymentStatus = "paid" | "issued" | "abandoned";

export interface Payment {
  id: string;
  endpoint_id: string;
  endpoint_path: string;
  payer: string;
  amount: string;
  currency: string;
  status: PaymentStatus;
  tx_hash: string | null;
  created_at: string;
}

export interface PayoutBatch {
  id: string;
  amount: string;
  currency: string;
  status: "pending" | "settled" | "failed";
  settled_at: string | null;
  tx_hash: string | null;
}

export interface PayoutConfig {
  address: string | null;
  batches: PayoutBatch[];
}

// ---------- Payer ----------

export interface PolicyRule {
  budget_per_period: {
    amount: string;
    period: "day" | "week" | "month";
  };
  max_per_transaction: string;
  merchant_allowlist: string[];
  merchant_denylist: string[];
}

export type PolicyStatus = "draft" | "deploying" | "active" | "revoked";

export interface Policy {
  id: string;
  name: string;
  rule: PolicyRule;
  status: PolicyStatus;
  contract_id: string | null;
  tx_hash: string | null;
  created_at: string;
}

export type AgentStatus = "active" | "paused";

export interface Agent {
  id: string;
  name: string;
  public_key: string;
  policy_id: string;
  status: AgentStatus;
  created_at: string;
}

export interface SpendEvent {
  id: string;
  agent_id: string;
  agent_name: string;
  merchant: string;
  amount: string;
  currency: string;
  budget_consumed_pct: number;
  created_at: string;
}

export type AuditDecision = "allowed" | "refused";

export interface AuditEntry {
  id: string;
  agent_id: string;
  agent_name: string;
  decision: AuditDecision;
  reason: string;
  merchant: string;
  amount: string;
  tx_hash: string | null;
  created_at: string;
}

export type AlertKind = "budget_threshold" | "unusual_merchant";

export interface AlertRule {
  id: string;
  kind: AlertKind;
  threshold_pct?: number;
  agent_id: string | null;
  enabled: boolean;
}

export interface WebhookConfig {
  url: string | null;
  email: string | null;
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertEvent {
  id: string;
  rule_id: string;
  agent_id: string;
  agent_name: string;
  severity: AlertSeverity;
  message: string;
  created_at: string;
}

// ---------- Shared ----------

export interface OverviewStats {
  revenue_in: { amount: string; currency: string; delta_pct: number };
  spend_out: { amount: string; currency: string; delta_pct: number };
  active_agents: number;
  active_endpoints: number;
  network: Network;
}
