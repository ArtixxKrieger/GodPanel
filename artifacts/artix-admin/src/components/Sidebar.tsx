import { useState } from "react";
import { useLocation, Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Users, Store, TrendingUp, Brain, Settings,
  ChevronLeft, ChevronRight, Activity, Zap,
  Shield, Globe, BarChart3
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Overview", badge: null },
  { href: "/users", icon: Users, label: "Users", badge: null },
  { href: "/stores", icon: Store, label: "Stores", badge: null },
  { href: "/revenue", icon: TrendingUp, label: "Revenue", badge: null },
  { href: "/analytics", icon: BarChart3, label: "Analytics", badge: null },
  { href: "/ai-usage", icon: Brain, label: "AI Usage", badge: "NEW" },
  { href: "/activity", icon: Activity, label: "Activity Log", badge: null },
  { href: "/security", icon: Shield, label: "Security", badge: null },
  { href: "/geo", icon: Globe, label: "Geo Map", badge: null },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen border-r border-border/60 bg-sidebar transition-all duration-300 ease-in-out flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-border/40">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/20">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <div className="text-sm font-bold text-foreground tracking-tight">ArtixPOS</div>
            <div className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest">Admin Panel</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const active = href === "/" ? location === "/" : location.startsWith(href);
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "sidebar-nav-item",
                  active && "active",
                  collapsed && "justify-center px-0"
                )}
                title={collapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!collapsed && (
                  <span className="flex-1">{label}</span>
                )}
                {!collapsed && badge && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-border/40 px-2 py-3">
        <Link href="/settings">
          <div className={cn("sidebar-nav-item", location === "/settings" && "active", collapsed && "justify-center px-0")}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Settings</span>}
          </div>
        </Link>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center py-3 border-t border-border/40 text-muted-foreground hover:text-foreground transition-colors"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
}
