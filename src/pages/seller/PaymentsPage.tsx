import { useState } from "react";
import { usePayments } from "@/hooks/queries";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getConfiguredNetwork } from "@/lib/network";
import { txExplorerUrl } from "@/lib/explorer";
import { downloadCsv } from "@/lib/csv";
import type { Payment, PaymentStatus } from "@/types";

const statusTone: Record<PaymentStatus, "success" | "warning" | "neutral"> = {
  paid: "success",
  issued: "warning",
  abandoned: "neutral",
};

export function PaymentsPage() {
  const [endpoint, setEndpoint] = useState("");
  const { data, isLoading } = usePayments({ endpoint: endpoint || undefined, page: 1, page_size: 50 });
  const network = getConfiguredNetwork();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-xl font-semibold">Payments</h1>
          <p className="text-sm text-slate-500">
            Every 402 challenge issued, paid, or abandoned — with the on-chain transaction link.
          </p>
        </div>
        <Button
          variant="secondary"
          disabled={!data?.items.length}
          onClick={() =>
            downloadCsv(
              "payments.csv",
              (data?.items ?? []).map((p) => ({
                id: p.id,
                endpoint: p.endpoint_path,
                payer: p.payer,
                amount: p.amount,
                status: p.status,
                tx_hash: p.tx_hash ?? "",
                created_at: p.created_at,
              })),
            )
          }
        >
          Export CSV
        </Button>
      </div>

      <input
        className="mb-4 w-64 rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
        placeholder="Filter by endpoint id…"
        value={endpoint}
        onChange={(e) => setEndpoint(e.target.value)}
      />

      {isLoading || !data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <DataTable<Payment>
          rowKey={(p) => p.id}
          rows={data.items}
          emptyLabel="No payments recorded yet"
          columns={[
            { header: "Endpoint", cell: (p) => <code className="text-xs">{p.endpoint_path}</code> },
            { header: "Payer", cell: (p) => <span className="font-mono text-xs">{p.payer.slice(0, 8)}…</span> },
            { header: "Amount", cell: (p) => `${p.amount} ${p.currency}`, align: "right" },
            { header: "Status", cell: (p) => <Badge tone={statusTone[p.status]}>{p.status}</Badge> },
            {
              header: "Tx",
              cell: (p) =>
                p.tx_hash ? (
                  <a
                    className="text-xs font-semibold text-brand-600 hover:underline"
                    href={txExplorerUrl(p.tx_hash, network)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    view
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
            { header: "Date", cell: (p) => new Date(p.created_at).toLocaleString() },
          ]}
        />
      )}
    </div>
  );
}
