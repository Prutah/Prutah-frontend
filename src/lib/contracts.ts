// Soroban policy-contract bindings.
//
// In production these come from the `contracts` repo's generated TypeScript
// package (Soroban CLI `contract bindings typescript` output) and are
// imported directly, e.g.:
//
//   import * as PolicyContract from "@tollgate/contracts-policy-client";
//
// That package isn't available while this dashboard is scaffolded standalone,
// so this module stands in for it with the same call shape the real client
// exposes. Swap the body of each function for the generated client once the
// package is wired in — call sites (PoliciesPage) should not need to change.
import type { PolicyRule } from "@/types";

export interface PolicyDeployResult {
  contract_id: string;
  unsigned_tx_xdr: string;
  network_passphrase: string;
}

export interface PolicySubmitResult {
  tx_hash: string;
}

async function notImplemented(): Promise<never> {
  throw new Error(
    "Soroban contract bindings are not wired in yet — import the generated client from the contracts repo.",
  );
}

export const policy = {
  /** Builds an unsigned `policy.deploy(params)` transaction for the connected wallet to sign. */
  deploy(_params: { name: string; rule: PolicyRule; sourceAddress: string }): Promise<PolicyDeployResult> {
    return notImplemented();
  },
  /** Builds an unsigned `policy.update(params)` transaction for an existing contract. */
  update(_params: { contractId: string; rule: PolicyRule; sourceAddress: string }): Promise<PolicyDeployResult> {
    return notImplemented();
  },
  /** Builds an unsigned `policy.revoke()` transaction. */
  revoke(_params: { contractId: string; sourceAddress: string }): Promise<PolicyDeployResult> {
    return notImplemented();
  },
  /** Submits a wallet-signed transaction XDR to the network. */
  submit(_signedTxXdr: string): Promise<PolicySubmitResult> {
    return notImplemented();
  },
};
