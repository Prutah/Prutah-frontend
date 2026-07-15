import clsx from "clsx";

export function BudgetBar({ pct, label }: { pct: number; label?: string }) {
  const clamped = Math.min(100, Math.max(0, pct));
  const tone = clamped >= 100 ? "bg-(--color-refused)" : clamped >= 80 ? "bg-(--color-pending)" : "bg-(--color-allowed)";

  return (
    <div className="w-full">
      {label && <p className="mb-1 text-xs text-slate-500">{label}</p>}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div className={clsx("h-full rounded-full transition-all", tone)} style={{ width: `${clamped}%` }} />
      </div>
      <p className="mt-0.5 font-tabular text-xs text-slate-400">{clamped.toFixed(0)}%</p>
    </div>
  );
}
