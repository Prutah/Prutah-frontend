import { useOverview } from "@/hooks/queries";
import { StatCard } from "@/components/ui/StatCard";

export function OverviewPage() {
  const { data, isLoading } = useOverview();

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Overview</h1>
      <p className="mb-6 text-sm text-slate-500">
        Combined snapshot of revenue in, spend out, and what's active right now.
      </p>

      {isLoading || !data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Revenue in"
            value={`${data.revenue_in.amount} ${data.revenue_in.currency}`}
            deltaPct={data.revenue_in.delta_pct}
            hint="last 30 days"
          />
          <StatCard
            label="Spend out"
            value={`${data.spend_out.amount} ${data.spend_out.currency}`}
            deltaPct={data.spend_out.delta_pct}
            hint="last 30 days"
          />
          <StatCard label="Active agents" value={String(data.active_agents)} />
          <StatCard label="Active endpoints" value={String(data.active_endpoints)} />
        </div>
      )}
    </div>
  );
}
