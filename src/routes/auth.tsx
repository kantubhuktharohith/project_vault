import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Project Vault" },
      { name: "description", content: "Sign in to manage your local project vault." },
    ],
  }),
});

function AuthPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");

  function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    toast.success("Signed into local vault");
    router.navigate({ to: "/" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          &gt; local_vault_access
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Project Vault is connected to a PostgreSQL database.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">access key</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter local key or leave blank"
            />
          </div>
          <Button type="submit" className="w-full">
            enter vault
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            back to vault
          </Link>
        </p>
      </div>
    </div>
  );
}
