import { apiFetch } from "./client";
import type { AlertRule, WebhookConfig } from "@/types";

export function listAlertRules() {
  return apiFetch<AlertRule[]>("/v1/alerts");
}

export interface CreateAlertRuleInput {
  kind: AlertRule["kind"];
  threshold_pct?: number;
  agent_id?: string | null;
}

export function createAlertRule(input: CreateAlertRuleInput) {
  return apiFetch<AlertRule>("/v1/alerts", { method: "POST", body: input });
}

export function setWebhookConfig(config: WebhookConfig) {
  return apiFetch<WebhookConfig>("/v1/alerts/webhooks", { method: "PUT", body: config });
}
