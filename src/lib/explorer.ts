import type { Network } from "@/types";

export function txExplorerUrl(txHash: string, network: Network): string {
  const subdomain = network === "mainnet" ? "stellar.expert/explorer/public" : "stellar.expert/explorer/testnet";
  return `https://${subdomain}/tx/${txHash}`;
}
