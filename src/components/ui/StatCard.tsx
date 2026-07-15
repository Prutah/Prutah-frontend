import clsx from "clsx";
import { Card } from "./Card";

interface StatCardProps {
  label: string;
  value: string;
  deltaPct?: number;
  hint?: string;
}

export function StatCard({ label, value, deltaPct, hint }: StatCardProps) {
  return (
    <Card className="p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 font-tabular text-2xl font-semibold text-slate-900 dark:text-slate-50">
        {value}
      </p>
      <div className="mt-1 flex items-center gap-2 text-xs">
        {deltaPct !== undefined && (
          <span
            className={clsx(
              "font-tabular font-semibold",
              deltaPct >= 0 ? "text-(--color-allowed)" : "text-(--color-refused)",
            )}
          >
            {deltaPct >= 0 ? "+" : ""}
            {deltaPct.toFixed(1)}%
          </span>
        )}
        {hint && <span className="text-slate-400">{hint}</span>}
      </div>
    </Card>
  );
}
