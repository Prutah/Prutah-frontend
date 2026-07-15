import { apiFetch } from "./client";
import type { Org, OverviewStats } from "@/types";

export function getOrg() {
  return apiFetch<Org>("/v1/org");
}

export function getOverview() {
  return apiFetch<OverviewStats>("/v1/overview");
}
