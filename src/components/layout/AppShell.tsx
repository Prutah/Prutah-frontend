import { NavLink, Outlet } from "react-router-dom";
import clsx from "clsx";
import { useOrg } from "@/hooks/queries";
import { getConfiguredNetwork } from "@/lib/network";

interface NavItem {
  to: string;
  label: string;
}

const sellerNav: NavItem[] = [
  { to: "/seller/endpoints", label: "Endpoints" },
  { to: "/seller/revenue", label: "Revenue" },
  { to: "/seller/payments", label: "Payments" },
  { to: "/seller/payouts", label: "Payouts" },
];

const payerNav: NavItem[] = [
  { to: "/payer/policies", label: "Policies" },
  { to: "/payer/agents", label: "Agents" },
  { to: "/payer/live-spend", label: "Live spend" },
  { to: "/payer/audit", label: "Audit trail" },
  { to: "/payer/alerts", label: "Alerts" },
];

const sharedNav: NavItem[] = [
  { to: "/org", label: "Org & members" },
  { to: "/settings", label: "Settings" },
];

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  return (
    <div className="mb-6">
      <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </p>
      <nav className="flex flex-col gap-0.5">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              clsx(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-100 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
              )
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export function AppShell() {
  const { data: org } = useOrg();
  const network = org?.network ?? getConfiguredNetwork();
  const roles = org?.roles ?? ["seller", "payer"];

  return (
    <div className={clsx("min-h-screen", network === "testnet" && "testnet-watermark")}>
      <div className="relative z-10 flex min-h-screen">
        <aside className="w-56 shrink-0 border-r border-(--color-border) bg-(--color-surface) p-4">
          <div className="mb-6 px-2">
            <p className="text-lg font-bold text-brand-600">Prutah</p>
            <p className="text-xs text-slate-400">{org?.name ?? "Loading org…"}</p>
          </div>
          <NavSection title="Overview" items={[{ to: "/", label: "Home" }]} />
          {roles.includes("seller") && <NavSection title="Seller" items={sellerNav} />}
          {roles.includes("payer") && <NavSection title="Payer" items={payerNav} />}
          <NavSection title="Org" items={sharedNav} />
        </aside>
        <div className="flex-1">
          <header className="flex items-center justify-between border-b border-(--color-border) bg-(--color-surface) px-6 py-3">
            <span className="text-sm text-slate-500">x402 agent payments, human control plane</span>
            <span
              className={clsx(
                "rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
                network === "testnet"
                  ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
              )}
            >
              {network}
            </span>
          </header>
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
