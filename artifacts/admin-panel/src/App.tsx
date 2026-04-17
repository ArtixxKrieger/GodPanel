import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/layout";
import { getToken } from "@/lib/auth";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Users from "@/pages/users";
import UserDetail from "@/pages/user-detail";
import Revenue from "@/pages/revenue";
import Stores from "@/pages/stores";
import StoreDetail from "@/pages/store-detail";
import AiUsage from "@/pages/ai-usage";
import Subscriptions from "@/pages/subscriptions";

const queryClient = new QueryClient();

// Redirect to dashboard if logged in, otherwise render children
function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (token) return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

// Redirect to login if not logged in, otherwise render in layout
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = getToken();
  if (!token) return <Redirect to="/login" />;
  return <Layout>{children}</Layout>;
}

function Router() {
  return (
    <Switch>
      {/* Root redirect */}
      <Route path="/">
        <Redirect to="/dashboard" />
      </Route>

      {/* Public routes */}
      <Route path="/login">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      </Route>
      
      <Route path="/users">
        <ProtectedRoute><Users /></ProtectedRoute>
      </Route>
      
      <Route path="/revenue">
        <ProtectedRoute><Revenue /></ProtectedRoute>
      </Route>
      
      <Route path="/stores">
        <ProtectedRoute><Stores /></ProtectedRoute>
      </Route>
      
      <Route path="/stores/:id">
        <ProtectedRoute><StoreDetail /></ProtectedRoute>
      </Route>
      
      <Route path="/ai-usage">
        <ProtectedRoute><AiUsage /></ProtectedRoute>
      </Route>
      <Route path="/subscriptions">
        <ProtectedRoute><Subscriptions /></ProtectedRoute>
      </Route>
      <Route path="/users/:id">
        <ProtectedRoute><UserDetail /></ProtectedRoute>
      </Route>

      {/* 404 */}
      <Route>
        <ProtectedRoute><NotFound /></ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
