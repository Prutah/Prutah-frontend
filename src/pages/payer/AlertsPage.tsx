import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAlertRules, useAgents, qk } from "@/hooks/queries";
import { useAlertStream } from "@/hooks/useStream";
import { alertsApi } from "@/api";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { AlertEvent, AlertRule } from "@/types";

const severityTone: Record<AlertEvent["severity"], "info" | "warning" | "danger"> = {
  info: "info",
  warning: "warning",
  critical: "danger",
};

export function AlertsPage() {
  const { data: rules, isLoading } = useAlertRules();
  const { data: agents } = useAgents();
  const events = useAlertStream();
  const client = useQueryClient();

  const [kind, setKind] = useState<AlertRule["kind"]>("budget_threshold");
  const [threshold, setThreshold] = useState("80");
  const [agentId, setAgentId] = useState("");

  const createRule = useMutation({
    mutationFn: () =>
      alertsApi.createAlertRule({
        kind,
        threshold_pct: kind === "budget_threshold" ? Number(threshold) : undefined,
        agent_id: agentId || null,
      }),
    onSuccess: () => client.invalidateQueries({ queryKey: qk.alerts }),
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Alerts</h1>
      <p className="mb-6 text-sm text-slate-500">
        Threshold and unusual-merchant alerts, delivered via webhook or email.
      </p>

      <Card className="mb-4 flex flex-wrap items-end gap-2 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Kind</label>
          <select
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            value={kind}
            onChange={(e) => setKind(e.target.value as AlertRule["kind"])}
          >
            <option value="budget_threshold">Budget threshold</option>
            <option value="unusual_merchant">Unusual merchant</option>
          </select>
        </div>
        {kind === "budget_threshold" && (
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-500">Threshold %</label>
            <input
              className="w-24 rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
              value={threshold}
              onChange={(e) => setThreshold(e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Agent (optional)</label>
          <select
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
          >
            <option value="">All agents</option>
            {agents?.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <Button onClick={() => createRule.mutate()} disabled={createRule.isPending}>
          Add rule
        </Button>
      </Card>

      {isLoading || !rules ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <DataTable<AlertRule>
          rowKey={(r) => r.id}
          rows={rules}
          emptyLabel="No alert rules yet"
          columns={[
            { header: "Kind", cell: (r) => r.kind.replace("_", " ") },
            { header: "Threshold", cell: (r) => (r.threshold_pct ? `${r.threshold_pct}%` : "—") },
            {
              header: "Scope",
              cell: (r) => (r.agent_id ? agents?.find((a) => a.id === r.agent_id)?.name ?? r.agent_id : "All agents"),
            },
            {
              header: "Enabled",
              cell: (r) => <Badge tone={r.enabled ? "success" : "neutral"}>{r.enabled ? "on" : "off"}</Badge>,
            },
          ]}
        />
      )}

      <h2 className="mt-8 mb-2 text-sm font-semibold text-slate-500">Live alert feed</h2>
      <DataTable<AlertEvent>
        rowKey={(e) => e.id}
        rows={events}
        emptyLabel="No alerts fired yet"
        columns={[
          { header: "Severity", cell: (e) => <Badge tone={severityTone[e.severity]}>{e.severity}</Badge> },
          { header: "Agent", cell: (e) => e.agent_name },
          { header: "Message", cell: (e) => e.message },
          { header: "Time", cell: (e) => new Date(e.created_at).toLocaleTimeString() },
        ]}
      />
    </div>
  );
}
