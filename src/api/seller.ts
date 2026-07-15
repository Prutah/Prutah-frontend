import { apiFetch } from "./client";
import type { Endpoint, Payment, PayoutConfig, RevenuePoint } from "@/types";

export function listEndpoints() {
  return apiFetch<Endpoint[]>("/v1/endpoints");
}

export interface RegisterEndpointInput {
  path: string;
  price: string;
  asset: string;
  free_tier?: Endpoint["free_tier"];
}

export function registerEndpoint(input: RegisterEndpointInput) {
  return apiFetch<Endpoint>("/v1/endpoints", { method: "POST", body: input });
}

export function updateEndpoint(id: string, patch: Partial<RegisterEndpointInput>) {
  return apiFetch<Endpoint>(`/v1/endpoints/${id}`, { method: "PATCH", body: patch });
}

export interface RevenueQuery {
  from?: string;
  to?: string;
  group_by?: "day" | "week" | "month" | "endpoint" | "payer";
  [key: string]: string | undefined;
}

export function getRevenue(query: RevenueQuery = {}) {
  return apiFetch<RevenuePoint[]>("/v1/revenue", { query });
}

export interface PaymentsQuery {
  endpoint?: string;
  payer?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | undefined;
}

export interface PaginatedPayments {
  items: Payment[];
  total: number;
  page: number;
  page_size: number;
}

export function listPayments(query: PaymentsQuery = {}) {
  return apiFetch<PaginatedPayments>("/v1/payments", { query });
}

export function getPayouts() {
  return apiFetch<PayoutConfig>("/v1/payouts");
}

export interface SetPayoutAddressInput {
  address: string;
  signed_challenge: string;
}

export function setPayoutAddress(input: SetPayoutAddressInput) {
  return apiFetch<PayoutConfig>("/v1/payouts/address", { method: "PUT", body: input });
}
