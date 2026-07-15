import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usePolicies, qk } from "@/hooks/queries";
import { payerApi } from "@/api";
import { policy as policyContract } from "@/lib/contracts";
import { connectWallet, signSorobanTx } from "@/lib/wallet";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { Policy, PolicyStatus } from "@/types";

const statusTone: Record<PolicyStatus, "success" | "warning" | "neutral" | "danger"> = {
  active: "success",
  deploying: "warning",
  draft: "neutral",
  revoked: "danger",
};

function planPreview(name: string, budget: string, period: string, cap: string, allowlist: string[]) {
  const merchants = allowlist.length ? allowlist.join(", ") : "any merchant";
  return `${name || "This agent"} may spend up to ${budget || "?"} USDC/${period}, only at ${merchants}, max ${cap || "?"} USDC per call.`;
}

export function PoliciesPage() {
  const { data: policies, isLoading } = usePolicies();
  const client = useQueryClient();
  const [name, setName] = useState("");
  const [budget, setBudget] = useState("");
  const [period, setPeriod] = useState<"day" | "week" | "month">("month");
  const [cap, setCap] = useState("");
  const [allowlist, setAllowlist] = useState("");
  const [deployError, setDeployError] = useState<string | null>(null);

  const draft = useMutation({
    mutationFn: () =>
      payerApi.draftPolicy({
        name,
        rule: {
          budget_per_period: { amount: budget, period },
          max_per_transaction: cap,
          merchant_allowlist: allowlist.split(",").map((s) => s.trim()).filter(Boolean),
          merchant_denylist: [],
        },
      }),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: qk.policies });
      setName("");
      setBudget("");
      setCap("");
      setAllowlist("");
    },
  });

  const deploy = useMutation({
    mutationFn: async (p: Policy) => {
      const sourceAddress = await connectWallet();
      const built = await policyContract.deploy({ name: p.name, rule: p.rule, sourceAddress });
      const signed = await signSorobanTx(built.unsigned_tx_xdr, built.network_passphrase);
      const submitted = await policyContract.submit(signed);
      return payerApi.confirmPolicyDeployed(p.id, {
        contract_id: built.contract_id,
        tx_hash: submitted.tx_hash,
      });
    },
    onSuccess: () => {
      setDeployError(null);
      client.invalidateQueries({ queryKey: qk.policies });
    },
    onError: (err) => setDeployError(err instanceof Error ? err.message : "Deployment failed"),
  });

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Policies</h1>
      <p className="mb-6 text-sm text-slate-500">
        Spending policies backed by on-chain policy contracts. Deploy or revoke with a wallet signature.
      </p>

      <Card className="mb-4 p-4">
        <h2 className="mb-3 text-sm font-semibold">Draft a policy</h2>
        <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <input
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            placeholder="Policy name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            placeholder="Budget (USDC)"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
          />
          <select
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            value={period}
            onChange={(e) => setPeriod(e.target.value as typeof period)}
          >
            <option value="day">per day</option>
            <option value="week">per week</option>
            <option value="month">per month</option>
          </select>
          <input
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            placeholder="Max per call (USDC)"
            value={cap}
            onChange={(e) => setCap(e.target.value)}
          />
        </div>
        <input
          className="mb-3 w-full rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
          placeholder="Merchant allowlist (comma separated globs, e.g. *.openai.com, *.anthropic.com)"
          value={allowlist}
          onChange={(e) => setAllowlist(e.target.value)}
        />
        <p className="mb-3 rounded-md bg-(--color-surface-muted) p-2 text-xs text-slate-500">
          {planPreview(name, budget, period, cap, allowlist.split(",").map((s) => s.trim()).filter(Boolean))}
        </p>
        <Button disabled={!name || !budget || !cap || draft.isPending} onClick={() => draft.mutate()}>
          Save draft
        </Button>
      </Card>

      {deployError && <p className="mb-3 text-xs text-(--color-refused)">{deployError}</p>}

      {isLoading || !policies ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <DataTable<Policy>
          rowKey={(p) => p.id}
          rows={policies}
          emptyLabel="No policies yet"
          columns={[
            { header: "Name", cell: (p) => p.name },
            {
              header: "Budget",
              cell: (p) => `${p.rule.budget_per_period.amount} USDC / ${p.rule.budget_per_period.period}`,
            },
            { header: "Max/call", cell: (p) => `${p.rule.max_per_transaction} USDC`, align: "right" },
            { header: "Status", cell: (p) => <Badge tone={statusTone[p.status]}>{p.status}</Badge> },
            {
              header: "",
              cell: (p) =>
                p.status === "draft" ? (
                  <Button variant="secondary" onClick={() => deploy.mutate(p)} disabled={deploy.isPending}>
                    Deploy
                  </Button>
                ) : (
                  <span className="font-mono text-xs text-slate-400">{p.contract_id ?? "—"}</span>
                ),
              align: "right",
            },
          ]}
        />
      )}
    </div>
  );
}
