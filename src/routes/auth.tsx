import { useState } from "react";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { useAdmin } from "@/hooks/use-admin";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Admin Login — Project Vault" },
      { name: "description", content: "Admin access to manage the project vault." },
    ],
  }),
});

function AuthPage() {
  const router = useRouter();
  const { isAdmin, login, logout, isLoggingIn } = useAdmin();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      await login(password);
      toast.success("Signed in as admin");
      router.navigate({ to: "/" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
    }
  }

  function handleLogout() {
    logout();
    toast.success("Signed out");
    setPassword("");
    setError("");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-sm">
        {isAdmin ? (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-primary text-glow">
              &gt; admin_session_active
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              You are signed in as admin. The vault management controls are visible on the main page.
            </p>
            <div className="mt-6 space-y-3">
              <Button onClick={handleLogout} variant="outline" className="w-full">
                sign out
              </Button>
              <Button asChild className="w-full">
                <Link to="/">back to vault</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-xl font-semibold tracking-tight text-foreground">
              &gt; vault_admin_access
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter the admin password to manage the project vault.
            </p>

            <form onSubmit={handleLogin} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="password">admin password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter admin password"
                  autoFocus
                />
              </div>

              {error ? (
                <p className="text-sm text-destructive">$ error: {error}</p>
              ) : null}

              <Button type="submit" className="w-full" disabled={isLoggingIn || !password.trim()}>
                {isLoggingIn ? "authenticating..." : "enter vault"}
              </Button>
            </form>
          </>
        )}

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link to="/" className="underline-offset-4 hover:underline">
            back to vault
          </Link>
        </p>
      </div>

      <Toaster />
    </div>
  );
}
