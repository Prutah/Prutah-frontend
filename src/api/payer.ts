import { apiFetch } from "./client";
import type { Agent, AuditEntry, Policy, PolicyRule, SpendEvent } from "@/types";

export function listPolicies() {
  return apiFetch<Policy[]>("/v1/policies");
}

export interface DraftPolicyInput {
  name: string;
  rule: PolicyRule;
}

export function draftPolicy(input: DraftPolicyInput) {
  return apiFetch<Policy>("/v1/policies", { method: "POST", body: input });
}

export interface ConfirmDeploymentInput {
  contract_id: string;
  tx_hash: string;
}

export function confirmPolicyDeployed(id: string, input: ConfirmDeploymentInput) {
  return apiFetch<Policy>(`/v1/policies/${id}/deployed`, { method: "POST", body: input });
}

export function listAgents() {
  return apiFetch<Agent[]>("/v1/agents");
}

export interface RegisterAgentInput {
  name: string;
  public_key: string;
  policy_id: string;
}

export function registerAgent(input: RegisterAgentInput) {
  return apiFetch<Agent>("/v1/agents", { method: "POST", body: input });
}

export function pauseAgent(id: string) {
  return apiFetch<Agent>(`/v1/agents/${id}/pause`, { method: "POST" });
}

export interface SpendQuery {
  agent?: string;
  from?: string;
  to?: string;
  [key: string]: string | undefined;
}

export function getSpend(query: SpendQuery = {}) {
  return apiFetch<SpendEvent[]>("/v1/spend", { query });
}

export interface AuditQuery {
  agent?: string;
  decision?: "allowed" | "refused";
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}

export interface PaginatedAudit {
  items: AuditEntry[];
  total: number;
  page: number;
  page_size: number;
}

export function getAudit(query: AuditQuery = {}) {
  return apiFetch<PaginatedAudit>("/v1/audit", { query });
}
