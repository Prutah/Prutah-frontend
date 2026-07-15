import { useRevenue } from "@/hooks/queries";
import { RevenueChart } from "@/components/charts/RevenueChart";
import { Card } from "@/components/ui/Card";

export function RevenuePage() {
  const { data, isLoading } = useRevenue({ group_by: "day" });

  const total = (data ?? []).reduce((sum, point) => sum + Number(point.amount), 0);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Revenue</h1>
      <p className="mb-6 text-sm text-slate-500">
        Live and historical earnings. Settlement status and CSV export live under Payouts.
      </p>

      {isLoading || !data ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <Card className="p-4">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-sm text-slate-500">Last {data.length} days</p>
            <p className="font-tabular text-lg font-semibold">{total.toFixed(2)} USDC</p>
          </div>
          <RevenueChart data={data} />
        </Card>
      )}
    </div>
  );
}
