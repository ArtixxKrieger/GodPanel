import { useEffect, useState, useCallback } from "react";
import { Search, Crown, Ban, CheckCircle2, RefreshCw, Download, ChevronUp, ChevronDown, X, Pencil, Trash2, Store } from "lucide-react";
import { api, AdminUser } from "@/lib/api";
import { formatDate, formatCurrency, getInitials, avatarColor, cn } from "@/lib/utils";
import TopBar from "@/components/TopBar";

const PLANS = [
  { value: "free",       label: "Free",       description: "Basic access, no subscription" },
  { value: "pro",        label: "Pro",        description: "Full features, monthly billing" },
  { value: "enterprise", label: "Enterprise", description: "Custom limits & priority support" },
] as const;

const ROLES = ["owner", "cashier", "admin"] as const;
const CURRENCIES = ["PHP", "USD", "EUR", "SGD", "MYR"] as const;

function ChangePlanDialog({ user, onClose, onSuccess }: { user: AdminUser; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [selected, setSelected] = useState(user.plan || "free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (selected === user.plan) { onClose(); return; }
    setLoading(true); setError("");
    try {
      await api.setUserPlan(user.id, selected);
      onSuccess(`${user.name || user.email}'s plan changed to ${selected}`);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to update plan");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground text-sm">Change Subscription Plan</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{user.name || user.email}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-2">
          {PLANS.map((plan) => (
            <button key={plan.value} onClick={() => setSelected(plan.value)} className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors ${selected === plan.value ? "border-primary bg-primary/5" : "border-border/50 hover:bg-secondary/40"}`}>
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${selected === plan.value ? "border-primary" : "border-muted-foreground/40"}`}>
                {selected === plan.value && <div className="w-2 h-2 rounded-full bg-primary" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">{plan.label}</span>
                  {plan.value === (user.plan || "free") && <span className="text-[10px] text-muted-foreground border border-border/50 rounded px-1 py-0.5">current</span>}
                </div>
                <div className="text-[11px] text-muted-foreground">{plan.description}</div>
              </div>
            </button>
          ))}
        </div>
        {error && <div className="mx-5 mb-3 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading || selected === (user.plan || "free")} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Saving..." : "Save Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditUserDialog({ user, onClose, onSuccess }: { user: AdminUser; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [role, setRole] = useState(user.role || "owner");
  const [storeName, setStoreName] = useState(user.storeName || "");
  const [businessType, setBusinessType] = useState(user.businessType || "");
  const [currency, setCurrency] = useState(user.currency || "PHP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!name.trim() || !email.trim()) { setError("Name and email are required"); return; }
    setLoading(true); setError("");
    try {
      await Promise.all([
        api.updateUser(user.id, { name: name.trim(), email: email.trim(), role }),
        api.updateUserSettings(user.id, { storeName: storeName.trim() || undefined, businessType: businessType.trim() || undefined, currency }),
      ]);
      onSuccess(`${name}'s profile updated`);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to update user");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-foreground text-sm">Edit User</h2>
            <p className="text-xs text-muted-foreground mt-0.5">ID: {user.id}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Account</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Role</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>

          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-1">Store Settings</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Store Name</label>
              <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder="Optional" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Business Type</label>
              <input value={businessType} onChange={(e) => setBusinessType(e.target.value)} className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" placeholder="e.g. Grocery" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        {error && <div className="mx-5 mb-3 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmDialog({ user, onClose, onSuccess }: { user: AdminUser; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    setLoading(true); setError("");
    try {
      await api.deleteUser(user.id);
      onSuccess(`${user.name || user.email} deleted`);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to delete user");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-sm">Delete User</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
            <Trash2 className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <div className="text-sm font-semibold text-foreground">{user.name || "Unknown"}</div>
              <div className="text-xs text-muted-foreground">{user.email}</div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">This will permanently delete the user and all their associated data (products, sales, expenses). This action cannot be undone.</p>
        </div>
        {error && <div className="mx-5 mb-3 text-xs text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</div>}
        <div className="flex gap-2 px-5 pb-5">
          <button onClick={onClose} disabled={loading} className="flex-1 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleDelete} disabled={loading} className="flex-1 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {loading ? "Deleting..." : "Delete Permanently"}
          </button>
        </div>
      </div>
    </div>
  );
}

type SortKey = "name" | "email" | "role" | "revenueTotal" | "createdAt";
type SortDir = "asc" | "desc";

export default function Users({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [bannedFilter, setBannedFilter] = useState<boolean | undefined>(undefined);
  const [sortKey, setSortKey] = useState<SortKey>("revenueTotal");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [actionUser, setActionUser] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);
  const [planUser, setPlanUser] = useState<AdminUser | null>(null);
  const [editUser, setEditUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 15;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.users({ search, role: roleFilter || undefined, banned: bannedFilter });
      setUsers(data);
    } catch (e: any) {
      showToast(e.message, "err");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, bannedFilter]);

  useEffect(() => { load(); }, [load]);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleBan = async (user: AdminUser) => {
    setActionLoading(user.id);
    try {
      if (user.isBanned) {
        await api.unbanUser(user.id);
        showToast(`${user.name} has been unbanned`, "ok");
      } else {
        await api.banUser(user.id);
        showToast(`${user.name} has been banned`, "ok");
      }
      await load();
    } catch (e: any) {
      showToast(e.message, "err");
    } finally {
      setActionLoading(null);
      setActionUser(null);
    }
  };

  const sorted = [...users].sort((a, b) => {
    let va: any = a[sortKey];
    let vb: any = b[sortKey];
    if (sortKey === "revenueTotal") { va = Number(va); vb = Number(vb); }
    if (va < vb) return sortDir === "asc" ? -1 : 1;
    if (va > vb) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("desc"); }
  };

  const toggleSelect = (id: string) => {
    const s = new Set(selected);
    if (s.has(id)) s.delete(id); else s.add(id);
    setSelected(s);
  };

  const selectAll = () => {
    if (selected.size === paginated.length) setSelected(new Set());
    else setSelected(new Set(paginated.map((u) => u.id)));
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="User Management" subtitle={`${users.length} total users`} onMenuOpen={onMenuOpen} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-xl border ${
          toast.type === "ok" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"
        }`}>{toast.msg}</div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
          <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
            <option value="">All Roles</option>
            <option value="owner">Owner</option>
            <option value="cashier">Cashier</option>
            <option value="admin">Admin</option>
          </select>
          <select value={bannedFilter === undefined ? "" : String(bannedFilter)} onChange={(e) => { const v = e.target.value; setBannedFilter(v === "" ? undefined : v === "true"); setPage(1); }}
            className="px-3 py-2 text-xs bg-card border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50">
            <option value="">All Status</option>
            <option value="false">Active</option>
            <option value="true">Banned</option>
          </select>
          <button onClick={() => load()} className="p-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:bg-secondary transition-colors text-xs text-muted-foreground">
            <Download className="w-3.5 h-3.5" />Export
          </button>
          {selected.size > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary border border-border text-xs">
              <span className="text-muted-foreground">{selected.size} selected</span>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total",  value: users.length,                                 color: "text-foreground" },
            { label: "Active", value: users.filter((u) => !u.isBanned).length,      color: "text-emerald-400" },
            { label: "Banned", value: users.filter((u) => u.isBanned).length,       color: "text-red-400" },
            { label: "Owners", value: users.filter((u) => u.role === "owner").length, color: "text-blue-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border/60 bg-secondary/40">
                  <th className="px-4 py-3 text-left">
                    <input type="checkbox" checked={selected.size === paginated.length && paginated.length > 0} onChange={selectAll} className="accent-emerald-500" />
                  </th>
                  {[
                    { key: "name" as SortKey,         label: "User" },
                    { key: "role" as SortKey,         label: "Role" },
                    { key: "revenueTotal" as SortKey, label: "Revenue" },
                    { key: "createdAt" as SortKey,    label: "Joined" },
                  ].map(({ key, label }) => (
                    <th key={key} onClick={() => toggleSort(key)} className="px-4 py-3 text-left font-semibold text-muted-foreground cursor-pointer hover:text-foreground transition-colors select-none">
                      <div className="flex items-center gap-1">
                        {label}
                        {sortKey === key ? (sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : <div className="w-3 h-3" />}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Store</th>
                  <th className="px-4 py-3 text-right font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="border-b border-border/40">
                      {[...Array(8)].map((__, j) => (
                        <td key={j} className="px-4 py-3"><div className="h-3 shimmer-loading rounded w-20" /></td>
                      ))}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">No users found</td></tr>
                ) : paginated.map((user) => (
                  <tr key={user.id} className={cn("data-table-row cursor-pointer", selected.has(user.id) && "bg-secondary/30")}>
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.has(user.id)} onChange={() => toggleSelect(user.id)} className="accent-emerald-500" onClick={(e) => e.stopPropagation()} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColor(String(user.id))} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                          {getInitials(user.name)}
                        </div>
                        <div>
                          <div className="font-medium text-foreground">{user.name || "Unknown"}</div>
                          <div className="text-muted-foreground text-[10px]">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                        user.role === "admin"   ? "bg-violet-500/15 text-violet-400 border-violet-500/25" :
                        user.role === "owner"   ? "bg-blue-500/15   text-blue-400   border-blue-500/25" :
                                                  "bg-secondary text-muted-foreground border-border"
                      )}>{user.role || "user"}</span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(user.revenueTotal)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(user.createdAt)}</td>
                    <td className="px-4 py-3">
                      {user.isBanned ? <span className="badge-banned">Banned</span> : <span className="badge-active">Active</span>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground truncate max-w-28">{user.storeName || "—"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Edit */}
                        <button onClick={() => setEditUser(user)} className="p-1.5 rounded-lg hover:bg-blue-500/15 text-muted-foreground hover:text-blue-400 transition-colors" title="Edit user">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        {/* Plan */}
                        <button onClick={() => setPlanUser(user)} className="p-1.5 rounded-lg hover:bg-amber-500/15 text-muted-foreground hover:text-amber-400 transition-colors" title="Change plan">
                          <Crown className="w-3.5 h-3.5" />
                        </button>
                        {/* Ban/Unban */}
                        <button onClick={() => handleBan(user)} disabled={actionLoading === user.id}
                          className={cn("p-1.5 rounded-lg transition-colors", user.isBanned ? "hover:bg-emerald-500/15 text-muted-foreground hover:text-emerald-400" : "hover:bg-red-500/15 text-muted-foreground hover:text-red-400")}
                          title={user.isBanned ? "Unban" : "Ban"}>
                          {actionLoading === user.id ? <div className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" /> : user.isBanned ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                        </button>
                        {/* Delete */}
                        <button onClick={() => setDeleteUser(user)} className="p-1.5 rounded-lg hover:bg-red-500/15 text-muted-foreground hover:text-red-400 transition-colors" title="Delete user">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border/40">
              <span className="text-xs text-muted-foreground">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)} className={cn("w-7 h-7 rounded-lg text-xs font-medium transition-colors", p === page ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground")}>{p}</button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {planUser   && <ChangePlanDialog  user={planUser}   onClose={() => setPlanUser(null)}   onSuccess={(msg) => { showToast(msg, "ok"); load(); }} />}
      {editUser   && <EditUserDialog    user={editUser}   onClose={() => setEditUser(null)}   onSuccess={(msg) => { showToast(msg, "ok"); load(); }} />}
      {deleteUser && <DeleteConfirmDialog user={deleteUser} onClose={() => setDeleteUser(null)} onSuccess={(msg) => { showToast(msg, "ok"); load(); }} />}
    </div>
  );
}
