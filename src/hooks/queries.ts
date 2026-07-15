import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { alertsApi, payerApi, sellerApi, sharedApi } from "@/api";
import type { PaymentsQuery, RevenueQuery } from "@/api/seller";
import type { AuditQuery, SpendQuery } from "@/api/payer";

export const qk = {
  org: ["org"] as const,
  overview: ["overview"] as const,
  endpoints: ["endpoints"] as const,
  revenue: (q: RevenueQuery) => ["revenue", q] as const,
  payments: (q: PaymentsQuery) => ["payments", q] as const,
  payouts: ["payouts"] as const,
  policies: ["policies"] as const,
  agents: ["agents"] as const,
  spend: (q: SpendQuery) => ["spend", q] as const,
  audit: (q: AuditQuery) => ["audit", q] as const,
  alerts: ["alerts"] as const,
};

export function useOrg() {
  return useQuery({ queryKey: qk.org, queryFn: sharedApi.getOrg });
}

export function useOverview() {
  return useQuery({ queryKey: qk.overview, queryFn: sharedApi.getOverview });
}

export function useEndpoints() {
  return useQuery({ queryKey: qk.endpoints, queryFn: sellerApi.listEndpoints });
}

export function useRegisterEndpoint() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: sellerApi.registerEndpoint,
    onSuccess: () => client.invalidateQueries({ queryKey: qk.endpoints }),
  });
}

export function useRevenue(query: RevenueQuery) {
  return useQuery({ queryKey: qk.revenue(query), queryFn: () => sellerApi.getRevenue(query) });
}

export function usePayments(query: PaymentsQuery) {
  return useQuery({ queryKey: qk.payments(query), queryFn: () => sellerApi.listPayments(query) });
}

export function usePayouts() {
  return useQuery({ queryKey: qk.payouts, queryFn: sellerApi.getPayouts });
}

export function usePolicies() {
  return useQuery({ queryKey: qk.policies, queryFn: payerApi.listPolicies });
}

export function useAgents() {
  return useQuery({ queryKey: qk.agents, queryFn: payerApi.listAgents });
}

export function usePauseAgent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: payerApi.pauseAgent,
    onSuccess: () => client.invalidateQueries({ queryKey: qk.agents }),
  });
}

export function useSpend(query: SpendQuery) {
  return useQuery({ queryKey: qk.spend(query), queryFn: () => payerApi.getSpend(query) });
}

export function useAudit(query: AuditQuery) {
  return useQuery({ queryKey: qk.audit(query), queryFn: () => payerApi.getAudit(query) });
}

export function useAlertRules() {
  return useQuery({ queryKey: qk.alerts, queryFn: alertsApi.listAlertRules });
}
