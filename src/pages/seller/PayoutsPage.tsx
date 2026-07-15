import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePayouts, qk } from "@/hooks/queries";
import { sellerApi } from "@/api";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { connectWallet, signChallenge } from "@/lib/wallet";
import { getConfiguredNetwork } from "@/lib/network";
import { txExplorerUrl } from "@/lib/explorer";
import type { PayoutBatch } from "@/types";

const batchTone: Record<PayoutBatch["status"], "success" | "warning" | "danger"> = {
  settled: "success",
  pending: "warning",
  failed: "danger",
};

export function PayoutsPage() {
  const { data, isLoading } = usePayouts();
  const client = useQueryClient();
  const network = getConfiguredNetwork();
  const [error, setError] = useState<string | null>(null);

  const setAddress = useMutation({
    mutationFn: async () => {
      const address = await connectWallet();
      // The backend issues a signing challenge; here we sign the address
      // itself as a stand-in since this dashboard is scaffolded without a
      // live backend challenge endpoint wired up yet.
      const signed_challenge = await signChallenge(`prutah:set-payout-address:${address}`);
      return sellerApi.setPayoutAddress({ address, signed_challenge });
    },
    onSuccess: () => {
      setError(null);
      client.invalidateQueries({ queryKey: qk.payouts });
    },
    onError: (err) => setError(err instanceof Error ? err.message : "Failed to set payout address"),
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Payouts</h1>
      <p className="mb-6 text-sm text-slate-500">
        Configure the receiving Stellar address and track settlement batches.
      </p>

      <Card className="mb-4 p-4">
        <h2 className="mb-2 text-sm font-semibold">Receiving address</h2>
        {isLoading || !data ? (
          <p className="text-sm text-slate-400">Loading…</p>
        ) : (
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm">{data.address ?? "Not set"}</p>
            <Button variant="secondary" onClick={() => setAddress.mutate()} disabled={setAddress.isPending}>
              {setAddress.isPending ? "Connecting Freighter…" : "Set with Freighter"}
            </Button>
          </div>
        )}
        {error && <p className="mt-2 text-xs text-(--color-refused)">{error}</p>}
      </Card>

      {isLoading || !data ? null : (
        <DataTable<PayoutBatch>
          rowKey={(b) => b.id}
          rows={data.batches}
          emptyLabel="No settlement batches yet"
          columns={[
            { header: "Amount", cell: (b) => `${b.amount} ${b.currency}`, align: "right" },
            { header: "Status", cell: (b) => <Badge tone={batchTone[b.status]}>{b.status}</Badge> },
            { header: "Settled", cell: (b) => (b.settled_at ? new Date(b.settled_at).toLocaleDateString() : "—") },
            {
              header: "Tx",
              cell: (b) =>
                b.tx_hash ? (
                  <a
                    className="text-xs font-semibold text-brand-600 hover:underline"
                    href={txExplorerUrl(b.tx_hash, network)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    view
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
          ]}
        />
      )}
    </div>
  );
}
