import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAdminMe } from "@workspace/api-client-react";
import { clearToken } from "@/lib/auth";
import { 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Store, 
  BrainCircuit,
  LogOut,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [location, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useAdminMe({
    query: {
      retry: false,
    }
  });

  // Handle unauthorized state directly in the layout to protect routes
  if (isError) {
    clearToken();
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <ShieldAlert className="w-10 h-10 text-muted-foreground opacity-50" />
          <div className="h-4 w-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    clearToken();
    setLocation("/login");
  };

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/users", label: "Users", icon: Users },
    { href: "/revenue", label: "Revenue", icon: BarChart3 },
    { href: "/stores", label: "Stores", icon: Store },
    { href: "/ai-usage", label: "AI Usage", icon: BrainCircuit },
  ];

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card flex flex-col hidden md:flex sticky top-0 h-screen">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold tracking-tight">ArtixPOS</h1>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Super Admin</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location === item.href || location.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur flex items-center px-8 sticky top-0 z-10 md:hidden">
          <div className="flex items-center gap-2 text-primary font-bold">
            <ShieldAlert className="w-5 h-5" />
            <span>ArtixPOS Admin</span>
          </div>
        </header>
        
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}