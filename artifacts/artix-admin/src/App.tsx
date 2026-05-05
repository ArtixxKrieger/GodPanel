import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { isAuthenticated, clearToken } from "@/lib/api";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Users from "@/pages/Users";
import Stores from "@/pages/Stores";
import Revenue from "@/pages/Revenue";
import Analytics from "@/pages/Analytics";
import AIUsage from "@/pages/AIUsage";
import Activity from "@/pages/Activity";
import Security from "@/pages/Security";
import GeoMap from "@/pages/GeoMap";
import SettingsPage from "@/pages/Settings";
import Sidebar from "@/components/Sidebar";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function AppShell() {
  const [authed, setAuthed] = useState(isAuthenticated());

  useEffect(() => {
    setAuthed(isAuthenticated());
  }, []);

  if (!authed) {
    return <Login onLogin={() => setAuthed(true)} />;
  }

  const handleLogout = () => {
    clearToken();
    setAuthed(false);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar onLogout={handleLogout} />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/users" component={Users} />
          <Route path="/stores" component={Stores} />
          <Route path="/revenue" component={Revenue} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/ai-usage" component={AIUsage} />
          <Route path="/activity" component={Activity} />
          <Route path="/security" component={Security} />
          <Route path="/geo" component={GeoMap} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <AppShell />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
