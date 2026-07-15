import { apiFetch } from "./client";
import type { AuthSession } from "@/types";

export function login(email: string, password: string) {
  return apiFetch<AuthSession>("/v1/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export interface ApiKey {
  id: string;
  label: string;
  scopes: string[];
  key: string; // only returned once, at creation
  created_at: string;
}

export function createApiKey(label: string, scopes: string[]) {
  return apiFetch<ApiKey>("/v1/auth/api-keys", {
    method: "POST",
    body: { label, scopes },
  });
}
