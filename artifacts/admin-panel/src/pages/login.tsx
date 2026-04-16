import { useState } from "react";
import { useLocation } from "wouter";
import { useAdminLogin } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, Loader2 } from "lucide-react";

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
        setError(err.data?.error || "Invalid password");
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setError("");
    loginMutation.mutate({ data: { password } });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <ShieldAlert className="w-12 h-12" />
          </div>
        </div>
        
        <Card className="border-border/50 shadow-xl bg-card/50 backdrop-blur">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold tracking-tight">Admin Gateway</CardTitle>
            <CardDescription>
              Enter the super-admin password to access ArtixPOS operations hub.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-border"
                  autoFocus
                />
                {error && <p className="text-sm text-destructive font-medium">{error}</p>}
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                disabled={loginMutation.isPending || !password}
              >
                {loginMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Authenticate
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}