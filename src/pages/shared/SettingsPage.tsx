import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { authApi, alertsApi } from "@/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getConfiguredNetwork } from "@/lib/network";

export function SettingsPage() {
  const [keyLabel, setKeyLabel] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState("");

  const createKey = useMutation({
    mutationFn: () => authApi.createApiKey(keyLabel || "unnamed key", ["read", "write"]),
    onSuccess: (key) => setCreatedKey(key.key),
  });

  const saveWebhook = useMutation({
    mutationFn: () => alertsApi.setWebhookConfig({ url: webhookUrl, email: null }),
  });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-xl font-semibold">Settings</h1>
      <p className="mb-6 text-sm text-slate-500">
        API keys for the backend, webhook endpoints, and the active network.
      </p>

      <Card className="mb-4 p-4">
        <h2 className="mb-2 text-sm font-semibold">Network</h2>
        <p className="text-sm text-slate-500">
          Currently targeting <span className="font-semibold">{getConfiguredNetwork()}</span>. Change{" "}
          <code className="rounded bg-(--color-surface-muted) px-1">VITE_STELLAR_NETWORK</code> to switch.
        </p>
      </Card>

      <Card className="mb-4 p-4">
        <h2 className="mb-2 text-sm font-semibold">API keys</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            placeholder="Key label"
            value={keyLabel}
            onChange={(e) => setKeyLabel(e.target.value)}
          />
          <Button onClick={() => createKey.mutate()} disabled={createKey.isPending}>
            Create key
          </Button>
        </div>
        {createdKey && (
          <p className="mt-2 rounded bg-(--color-surface-muted) p-2 font-mono text-xs">
            {createdKey} <span className="text-slate-400">(shown once — store it now)</span>
          </p>
        )}
      </Card>

      <Card className="p-4">
        <h2 className="mb-2 text-sm font-semibold">Webhook endpoint</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            placeholder="https://hooks.example.com/alerts"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
          />
          <Button onClick={() => saveWebhook.mutate()} disabled={saveWebhook.isPending}>
            Save
          </Button>
        </div>
      </Card>
    </div>
  );
}
