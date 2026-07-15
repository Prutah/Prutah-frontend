import { useMemo } from "react";
import { useSpendStream } from "@/hooks/useStream";
import { Card } from "@/components/ui/Card";
import { BudgetBar } from "@/components/ui/BudgetBar";
import { DataTable } from "@/components/ui/DataTable";
import type { SpendEvent } from "@/types";

export function LiveSpendPage() {
  const events = useSpendStream();

  const latestByAgent = useMemo(() => {
    const map = new Map<string, SpendEvent>();
    for (const event of events) {
      if (!map.has(event.agent_id)) map.set(event.agent_id, event);
    }
    return Array.from(map.values());
  }, [events]);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Live spend</h1>
      <p className="mb-6 text-sm text-slate-500">
        Real-time spend feed per agent, streamed over SSE from <code>/v1/stream/spend</code>.
      </p>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {latestByAgent.length === 0 && (
          <p className="text-sm text-slate-400">Waiting for the first event…</p>
        )}
        {latestByAgent.map((event) => (
          <Card key={event.agent_id} className="p-4">
            <p className="mb-2 text-sm font-semibold">{event.agent_name}</p>
            <BudgetBar pct={event.budget_consumed_pct} label="of monthly budget" />
          </Card>
        ))}
      </div>

      <h2 className="mb-2 text-sm font-semibold text-slate-500">Event feed</h2>
      <DataTable<SpendEvent>
        rowKey={(e) => e.id}
        rows={events}
        emptyLabel="No spend events yet"
        columns={[
          { header: "Agent", cell: (e) => e.agent_name },
          { header: "Merchant", cell: (e) => e.merchant },
          { header: "Amount", cell: (e) => `${e.amount} ${e.currency}`, align: "right" },
          { header: "Budget used", cell: (e) => `${e.budget_consumed_pct.toFixed(0)}%`, align: "right" },
          { header: "Time", cell: (e) => new Date(e.created_at).toLocaleTimeString() },
        ]}
      />
    </div>
  );
}
