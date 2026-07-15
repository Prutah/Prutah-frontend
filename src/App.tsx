import { Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { OverviewPage } from "@/pages/shared/OverviewPage";
import { OrgPage } from "@/pages/shared/OrgPage";
import { SettingsPage } from "@/pages/shared/SettingsPage";
import { LoginPage } from "@/pages/shared/LoginPage";
import { EndpointsPage } from "@/pages/seller/EndpointsPage";
import { RevenuePage } from "@/pages/seller/RevenuePage";
import { PaymentsPage } from "@/pages/seller/PaymentsPage";
import { PayoutsPage } from "@/pages/seller/PayoutsPage";
import { PoliciesPage } from "@/pages/payer/PoliciesPage";
import { AgentsPage } from "@/pages/payer/AgentsPage";
import { LiveSpendPage } from "@/pages/payer/LiveSpendPage";
import { AuditTrailPage } from "@/pages/payer/AuditTrailPage";
import { AlertsPage } from "@/pages/payer/AlertsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<AppShell />}>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/org" element={<OrgPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        <Route path="/seller/endpoints" element={<EndpointsPage />} />
        <Route path="/seller/revenue" element={<RevenuePage />} />
        <Route path="/seller/payments" element={<PaymentsPage />} />
        <Route path="/seller/payouts" element={<PayoutsPage />} />

        <Route path="/payer/policies" element={<PoliciesPage />} />
        <Route path="/payer/agents" element={<AgentsPage />} />
        <Route path="/payer/live-spend" element={<LiveSpendPage />} />
        <Route path="/payer/audit" element={<AuditTrailPage />} />
        <Route path="/payer/alerts" element={<AlertsPage />} />
      </Route>
    </Routes>
  );
}
