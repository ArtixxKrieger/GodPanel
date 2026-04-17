import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAdminMe } from "@workspace/api-client-react";
import { clearToken } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Store,
  BrainCircuit,
  CreditCard,
  LogOut,
  ShieldCheck,
  Menu,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/users", label: "Users", icon: Users },
  { href: "/revenue", label: "Revenue", icon: BarChart3 },
  { href: "/stores", label: "Stores", icon: Store },
  { href: "/subscriptions", label: "Subscriptions", icon: CreditCard },
  { href: "/ai-usage", label: "AI", icon: BrainCircuit },
];

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: user, isLoading, isError } = useAdminMe({ query: { retry: false } });

  if (isError) {
    clearToken();
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary animate-pulse" />
          </div>
          <p className="text-sm text-muted-foreground">Verifying session…</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center gap-3 px-5 border-b border-border/60 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <ShieldCheck className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <p className="font-bold text-sm leading-tight">ArtixPOS</p>
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Admin</p>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border/60 shrink-0">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 border-r border-border/60 bg-card/80 flex-col sticky top-0 h-screen shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-50 w-64 bg-card border-r border-border flex flex-col h-full shadow-2xl">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border/60 bg-card/80 backdrop-blur-sm flex items-center justify-between px-4 sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-foreground" />
              </div>
              <span className="font-bold text-sm">ArtixPOS Admin</span>
            </div>
            <div className="hidden lg:block">
              {(() => {
                const current = navItems.find(n => location === n.href || (n.href !== "/dashboard" && location.startsWith(n.href)));
                return current ? (
                  <p className="text-sm font-semibold text-foreground">{current.label}</p>
                ) : null;
              })()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Live</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto pb-24 lg:pb-8">
            {children}
          </div>
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border/60">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => {
              const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(`${item.href}/`));
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all min-w-0",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <div className={cn("p-1.5 rounded-lg transition-all", isActive ? "bg-primary/10" : "")}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
