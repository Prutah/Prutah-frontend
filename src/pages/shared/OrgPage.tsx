import { useOrg } from "@/hooks/queries";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import type { OrgMember } from "@/types";

export function OrgPage() {
  const { data: org, isLoading } = useOrg();

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Org & members</h1>
      <p className="mb-6 text-sm text-slate-500">
        One organization can hold both the seller and payer roles. Members get viewer or admin access.
      </p>

      {isLoading || !org ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <>
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-medium">{org.name}</span>
            {org.roles.map((role) => (
              <Badge key={role} tone="info">
                {role}
              </Badge>
            ))}
          </div>
          <DataTable<OrgMember>
            rowKey={(m) => m.id}
            rows={org.members}
            emptyLabel="No members yet"
            columns={[
              { header: "Name", cell: (m) => m.name },
              { header: "Email", cell: (m) => m.email },
              {
                header: "Role",
                cell: (m) => <Badge tone={m.role === "admin" ? "info" : "neutral"}>{m.role}</Badge>,
              },
            ]}
          />
        </>
      )}
    </div>
  );
}
