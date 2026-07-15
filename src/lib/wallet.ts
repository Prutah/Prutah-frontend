import { Buffer } from "buffer";
import {
  getAddress,
  isConnected,
  requestAccess,
  signAuthEntry,
  signMessage,
  signTransaction,
} from "@stellar/freighter-api";

export class WalletError extends Error {}

async function unwrap<T extends { error?: unknown }>(promise: Promise<T>): Promise<Omit<T, "error">> {
  const result = await promise;
  if (result.error) {
    throw new WalletError(typeof result.error === "string" ? result.error : "Freighter request failed");
  }
  return result;
}

export async function isWalletAvailable(): Promise<boolean> {
  const { isConnected: connected } = await isConnected();
  return connected;
}

export async function connectWallet(): Promise<string> {
  const { address } = await unwrap(requestAccess());
  return address;
}

export async function getConnectedAddress(): Promise<string | null> {
  try {
    const { address } = await unwrap(getAddress());
    return address || null;
  } catch {
    return null;
  }
}

// Used to prove ownership of the payout Stellar address (PUT /v1/payouts/address).
export async function signChallenge(challenge: string): Promise<string> {
  const result = await unwrap(signMessage(challenge));
  const signed = result.signedMessage;
  if (typeof signed === "string") return signed;
  return signed ? signed.toString("base64") : "";
}

// Signs a Soroban transaction envelope XDR built client-side for
// policy.deploy / policy.update / policy.revoke (see lib/contracts.ts).
export async function signSorobanTx(xdr: string, networkPassphrase: string): Promise<string> {
  const { signedTxXdr } = await unwrap(signTransaction(xdr, { networkPassphrase }));
  return signedTxXdr;
}

export async function signAuth(entryXdr: string, networkPassphrase: string): Promise<Buffer | null> {
  const { signedAuthEntry } = await unwrap(signAuthEntry(entryXdr, { networkPassphrase }));
  return signedAuthEntry;
}
