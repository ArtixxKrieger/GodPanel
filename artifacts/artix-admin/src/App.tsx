import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
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
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Switch>
          <Route path="/" component={() => <Dashboard onMenuOpen={() => setMobileOpen(true)} />} />
          <Route path="/users" component={() => <Users onMenuOpen={() => setMobileOpen(true)} />} />
          <Route path="/stores" component={() => <Stores onMenuOpen={() => setMobileOpen(true)} />} />
          <Route path="/revenue" component={() => <Revenue onMenuOpen={() => setMobileOpen(true)} />} />
          <Route path="/analytics" component={() => <Analytics onMenuOpen={() => setMobileOpen(true)} />} />
          <Route path="/ai-usage" component={() => <AIUsage onMenuOpen={() => setMobileOpen(true)} />} />
          <Route path="/activity" component={() => <Activity onMenuOpen={() => setMobileOpen(true)} />} />
          <Route path="/security" component={() => <Security onMenuOpen={() => setMobileOpen(true)} />} />
          <Route path="/geo" component={() => <GeoMap onMenuOpen={() => setMobileOpen(true)} />} />
          <Route path="/settings" component={() => <SettingsPage onMenuOpen={() => setMobileOpen(true)} />} />
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
