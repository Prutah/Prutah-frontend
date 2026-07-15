import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAgents, usePauseAgent, usePolicies, qk } from "@/hooks/queries";
import { payerApi } from "@/api";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Agent } from "@/types";

export function AgentsPage() {
  const { data: agents, isLoading } = useAgents();
  const { data: policies } = usePolicies();
  const pause = usePauseAgent();
  const client = useQueryClient();

  const [name, setName] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [policyId, setPolicyId] = useState("");

  const register = useMutation({
    mutationFn: () => payerApi.registerAgent({ name, public_key: publicKey, policy_id: policyId }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: qk.agents });
      setName("");
      setPublicKey("");
      setPolicyId("");
    },
  });

  const policyName = (id: string) => policies?.find((p) => p.id === id)?.name ?? id;

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Agents</h1>
      <p className="mb-6 text-sm text-slate-500">
        Register agent identities, bind each to a policy, and pause instantly if something looks wrong.
      </p>

      <Card className="mb-4 flex flex-wrap items-end gap-2 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Name</label>
          <input
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            placeholder="agent-x"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Public key</label>
          <input
            className="w-64 rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm font-mono"
            placeholder="G..."
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Policy</label>
          <select
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            value={policyId}
            onChange={(e) => setPolicyId(e.target.value)}
          >
            <option value="">Select…</option>
            {policies?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <Button
          disabled={!name || !publicKey || !policyId || register.isPending}
          onClick={() => register.mutate()}
        >
          Register agent
        </Button>
      </Card>

      {isLoading || !agents ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <DataTable<Agent>
          rowKey={(a) => a.id}
          rows={agents}
          emptyLabel="No agents registered yet"
          columns={[
            { header: "Name", cell: (a) => a.name },
            { header: "Public key", cell: (a) => <span className="font-mono text-xs">{a.public_key}</span> },
            { header: "Policy", cell: (a) => policyName(a.policy_id) },
            {
              header: "Status",
              cell: (a) => <Badge tone={a.status === "active" ? "success" : "danger"}>{a.status}</Badge>,
            },
            {
              header: "",
              cell: (a) => (
                <Button
                  variant={a.status === "active" ? "danger" : "secondary"}
                  onClick={() => pause.mutate(a.id)}
                  disabled={pause.isPending}
                >
                  {a.status === "active" ? "Pause" : "Resume"}
                </Button>
              ),
              align: "right",
            },
          ]}
        />
      )}
    </div>
  );
}
