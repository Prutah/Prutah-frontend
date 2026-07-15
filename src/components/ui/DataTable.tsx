import type { ReactNode } from "react";
import { EmptyState } from "./EmptyState";

export interface Column<T> {
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyLabel?: string;
}

export function DataTable<T>({ columns, rows, rowKey, emptyLabel = "No data yet" }: DataTableProps<T>) {
  if (rows.length === 0) return <EmptyState label={emptyLabel} />;

  return (
    <div className="overflow-x-auto rounded-lg border border-(--color-border)">
      <table className="w-full min-w-max text-left text-sm">
        <thead className="border-b border-(--color-border) bg-(--color-surface-muted)">
          <tr>
            {columns.map((col) => (
              <th
                key={col.header}
                className={
                  col.align === "right"
                    ? "px-4 py-2 text-right font-semibold text-slate-500"
                    : "px-4 py-2 font-semibold text-slate-500"
                }
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-(--color-border) last:border-0 hover:bg-(--color-surface-muted)">
              {columns.map((col) => (
                <td
                  key={col.header}
                  className={
                    col.align === "right"
                      ? "px-4 py-2 text-right font-tabular"
                      : "px-4 py-2"
                  }
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
