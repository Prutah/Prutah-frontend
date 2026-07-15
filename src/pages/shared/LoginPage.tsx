import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { authApi } from "@/api";
import { setToken } from "@/api/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: () => authApi.login(email, password),
    onSuccess: (session) => {
      setToken(session.token);
      navigate("/");
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-(--color-surface-muted)">
      <Card className="w-full max-w-sm p-6">
        <p className="mb-1 text-lg font-bold text-brand-600">Prutah</p>
        <p className="mb-6 text-sm text-slate-500">Sign in to your org</p>
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            login.mutate();
          }}
        >
          <input
            type="email"
            required
            placeholder="you@company.com"
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            required
            placeholder="Password"
            className="rounded-md border border-(--color-border) bg-transparent px-3 py-1.5 text-sm"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button type="submit" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
          </Button>
          {login.isError && <p className="text-xs text-(--color-refused)">Login failed. Check your credentials.</p>}
        </form>
      </Card>
    </div>
  );
}
