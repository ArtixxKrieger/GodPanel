import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ShieldCheck, Loader2, Lock } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        if (data.token) {
          setToken(data.token);
          setLocation("/dashboard");
        } else {
          setError(data.message || "Login failed");
        }
      },
      onError: (err) => {
        setError((err.data as any)?.error || "Invalid password");
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError("");
    loginMutation.mutate({ data: { password } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 mb-4">
            <ShieldCheck className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">ArtixPOS Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Super-admin operations hub</p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border/60 rounded-2xl shadow-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Admin Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 bg-background border-border/60 focus:border-primary h-11"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1.5 mt-1">
                  <span className="w-1 h-1 rounded-full bg-destructive inline-block" />
                  {error}
                </p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full h-11 font-semibold shadow-sm shadow-primary/20"
              disabled={loginMutation.isPending || !password}
            >
              {loginMutation.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Authenticating…</>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Restricted access · ArtixPOS Platform
        </p>
      </div>
    </div>
  );
}
