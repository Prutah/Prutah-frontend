import { useState } from "react";
import { useAudit, useAgents } from "@/hooks/queries";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getConfiguredNetwork } from "@/lib/network";
import { txExplorerUrl } from "@/lib/explorer";
import { downloadCsv } from "@/lib/csv";
import type { AuditEntry, AuditDecision } from "@/types";

export function AuditTrailPage() {
  const [agent, setAgent] = useState("");
  const [decision, setDecision] = useState<AuditDecision | "">("");
  const { data: agents } = useAgents();
  const { data, isLoading } = useAudit({
    agent: agent || undefined,
    decision: decision || undefined,
    page_size: 50,
  });
  const network = getConfiguredNetwork();

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="mb-1 text-xl font-semibold">Audit trail</h1>
          <p className="text-sm text-slate-500">
            Every policy decision — what was allowed, what was refused, and why. This is the evidence the policy
            engine works.
          </p>
        </div>
        <Button
          variant="secondary"
          disabled={!data?.items.length}
          onClick={() =>
            downloadCsv(
              "audit.csv",
              (data?.items ?? []).map((a) => ({
                agent: a.agent_name,
                decision: a.decision,
                reason: a.reason,
                merchant: a.merchant,
                amount: a.amount,
                tx_hash: a.tx_hash ?? "",
                created_at: a.created_at,
              })),
            )
          }
        >
          Export CSV
        </Button>
      </div>

      <div className="mb-4 flex gap-2">
        <select
          className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
          value={agent}
          onChange={(e) => setAgent(e.target.value)}
        >
          <option value="">All agents</option>
          {agents?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>
        <select
          className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
          value={decision}
          onChange={(e) => setDecision(e.target.value as AuditDecision | "")}
        >
          <option value="">Allowed & refused</option>
          <option value="allowed">Allowed only</option>
          <option value="refused">Refused only</option>
        </select>
      </div>

      {isLoading || !data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <DataTable<AuditEntry>
          rowKey={(a) => a.id}
          rows={data.items}
          emptyLabel="No decisions logged yet"
          columns={[
            { header: "Agent", cell: (a) => a.agent_name },
            {
              header: "Decision",
              cell: (a) => <Badge tone={a.decision === "allowed" ? "success" : "danger"}>{a.decision}</Badge>,
            },
            { header: "Reason", cell: (a) => <span className="text-xs text-slate-500">{a.reason}</span> },
            { header: "Merchant", cell: (a) => a.merchant },
            { header: "Amount", cell: (a) => `${a.amount} USDC`, align: "right" },
            {
              header: "Tx",
              cell: (a) =>
                a.tx_hash ? (
                  <a
                    className="text-xs font-semibold text-brand-600 hover:underline"
                    href={txExplorerUrl(a.tx_hash, network)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    view
                  </a>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                ),
            },
            { header: "Time", cell: (a) => new Date(a.created_at).toLocaleString() },
          ]}
        />
      )}
    </div>
  );
}
