import type { Network } from "@/types";

export function getConfiguredNetwork(): Network {
  const value = import.meta.env.VITE_STELLAR_NETWORK;
  return value === "mainnet" ? "mainnet" : "testnet";
}
