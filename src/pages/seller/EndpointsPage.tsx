import { useState } from "react";
import { useEndpoints, useRegisterEndpoint } from "@/hooks/queries";
import { DataTable } from "@/components/ui/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { Endpoint } from "@/types";

function snippetFor(endpoint: Pick<Endpoint, "path" | "price" | "asset">) {
  return `// seller-kit middleware
app.use("${endpoint.path}", prutah({
  price: "${endpoint.price}",
  asset: "${endpoint.asset}",
}));`;
}

export function EndpointsPage() {
  const { data: endpoints, isLoading } = useEndpoints();
  const registerEndpoint = useRegisterEndpoint();
  const [path, setPath] = useState("");
  const [price, setPrice] = useState("");
  const [snippetFrom, setSnippetFrom] = useState<Endpoint | null>(null);

  return (
    <div>
      <h1 className="mb-1 text-xl font-semibold">Endpoints</h1>
      <p className="mb-6 text-sm text-slate-500">
        Register API endpoints, set per-call pricing, and copy the seller-kit snippet for your middleware.
      </p>

      <Card className="mb-4 flex flex-wrap items-end gap-2 p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Path</label>
          <input
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            placeholder="/v1/your/route"
            value={path}
            onChange={(e) => setPath(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-500">Price (USDC)</label>
          <input
            className="w-28 rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            placeholder="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <Button
          disabled={!path || !price || registerEndpoint.isPending}
          onClick={() =>
            registerEndpoint.mutate(
              { path, price, asset: "USDC", free_tier: { enabled: false } },
              { onSuccess: () => { setPath(""); setPrice(""); } },
            )
          }
        >
          Register endpoint
        </Button>
      </Card>

      {isLoading || !endpoints ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <DataTable<Endpoint>
          rowKey={(e) => e.id}
          rows={endpoints}
          emptyLabel="No endpoints registered yet"
          columns={[
            { header: "Path", cell: (e) => <code className="text-xs">{e.path}</code> },
            { header: "Price", cell: (e) => `${e.price} ${e.asset}`, align: "right" },
            {
              header: "Free tier",
              cell: (e) =>
                e.free_tier.enabled ? (
                  <Badge tone="success">
                    {e.free_tier.calls_per_period}/{e.free_tier.period}
                  </Badge>
                ) : (
                  <Badge tone="neutral">off</Badge>
                ),
            },
            {
              header: "",
              cell: (e) => (
                <button
                  className="text-xs font-semibold text-brand-600 hover:underline"
                  onClick={() => setSnippetFrom(e)}
                >
                  View snippet
                </button>
              ),
              align: "right",
            },
          ]}
        />
      )}

      {snippetFrom && (
        <Card className="mt-4 p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">seller-kit snippet — {snippetFrom.path}</h2>
            <button className="text-xs text-slate-400 hover:text-slate-600" onClick={() => setSnippetFrom(null)}>
              close
            </button>
          </div>
          <pre className="overflow-x-auto rounded-md bg-(--color-surface-muted) p-3 text-xs">
            <code>{snippetFor(snippetFrom)}</code>
          </pre>
        </Card>
      )}
    </div>
  );
}
