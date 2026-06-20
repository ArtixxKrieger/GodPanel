import { useEffect, useState } from "react";
import { Store, Search, Package, ShoppingCart, DollarSign, X, RefreshCw, Pencil } from "lucide-react";
import { api, StoreSummary, StoreDetail } from "@/lib/api";
import { formatCurrency, formatDate, getInitials, avatarColor, cn } from "@/lib/utils";
import TopBar from "@/components/TopBar";

const CURRENCIES = ["PHP", "USD", "EUR", "SGD", "MYR"];

function EditStoreDialog({ store, onClose, onSuccess }: { store: StoreSummary; onClose: () => void; onSuccess: (msg: string) => void }) {
  const [storeName, setStoreName] = useState(store.storeName || "");
  const [businessType, setBusinessType] = useState(store.businessType || "");
  const [currency, setCurrency] = useState(store.currency || "PHP");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true); setError("");
    try {
      await api.updateUserSettings(store.userId, {
        storeName: storeName.trim() || undefined,
        businessType: businessType.trim() || undefined,
        currency,
      });
      onSuccess(`${storeName || store.storeName} updated`);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to update store");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl border border-border/60 bg-card shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border/50 flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-sm">Edit Store Settings</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors"><X className="w-4 h-4 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-3">
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Store Name</label>
            <input value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
          <div>
            <label className="text-[11px] text-muted-foreground block mb-1">Business Type</label>
            <input value={businessType} onChange={(e) => setBusinessType(e.target.value)} placeholder="e.g. Grocery, Electronics" className="w-full px-3 py-2 text-xs bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
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
          <button onClick={handleSave} disabled={loading} className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition-opacity">
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Stores({ onMenuOpen }: { onMenuOpen?: () => void }) {
  const [stores, setStores] = useState<StoreSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<StoreSummary | null>(null);
  const [detail, setDetail] = useState<StoreDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editStore, setEditStore] = useState<StoreSummary | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  const showToast = (msg: string, type: "ok" | "err") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = () => {
    setLoading(true);
    api.stores().then(setStores).catch(() => setStores([])).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (store: StoreSummary) => {
    setSelected(store);
    setDetailLoading(true);
    try {
      const d = await api.storeDetail(store.userId);
      setDetail(d);
    } catch {
      setDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleSuspend = async (store: StoreSummary) => {
    setActionLoading(store.userId);
    try {
      if (store.isBanned) {
        await api.unbanUser(store.userId);
        showToast(`${store.storeName} unsuspended`, "ok");
      } else {
        await api.banUser(store.userId);
        showToast(`${store.storeName} suspended`, "ok");
      }
      load();
      if (selected?.userId === store.userId) {
        setSelected((prev) => prev ? { ...prev, isBanned: !store.isBanned } : null);
      }
    } catch (e: any) {
      showToast(e.message, "err");
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = stores.filter((s) =>
    !search || s.storeName.toLowerCase().includes(search.toLowerCase()) || s.ownerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <TopBar title="Store Explorer" subtitle={`${stores.length} stores across the platform`} onMenuOpen={onMenuOpen} />

      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-sm font-medium shadow-xl border ${
          toast.type === "ok" ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"
        }`}>{toast.msg}</div>
      )}

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Total Stores", value: stores.length,                          color: "text-foreground" },
            { label: "Active",       value: stores.filter((s) => !s.isBanned).length, color: "text-emerald-400" },
            { label: "Suspended",    value: stores.filter((s) => s.isBanned).length,  color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl border border-border/60 bg-card px-4 py-3">
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Search + Refresh */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input type="text" placeholder="Search stores or owners..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
          </div>
          <button onClick={load} className="p-2.5 rounded-lg bg-card border border-border hover:bg-secondary transition-colors">
            <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            [...Array(6)].map((_, i) => <div key={i} className="rounded-xl border border-border/60 bg-card p-5 h-44 shimmer-loading" />)
          ) : filtered.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-muted-foreground">No stores found</div>
          ) : filtered.map((store) => (
            <div key={store.userId} onClick={() => openDetail(store)} className="rounded-xl border border-border/60 bg-card p-5 cursor-pointer hover:border-primary/40 transition-all hover:-translate-y-0.5 group">
              <div className="flex items-start gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(String(store.userId))} flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg`}>
                  {getInitials(store.storeName)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-sm truncate">{store.storeName}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{store.ownerEmail}</div>
                </div>
                {store.isBanned ? <span className="badge-banned text-[10px]">Suspended</span> : <span className="badge-active text-[10px]">Active</span>}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { icon: DollarSign, label: "Revenue",  value: formatCurrency(store.revenue), color: "text-emerald-400" },
                  { icon: ShoppingCart, label: "Sales",  value: store.salesCount,               color: "text-blue-400" },
                  { icon: Package, label: "Products",    value: store.productCount,              color: "text-violet-400" },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="rounded-lg bg-secondary/60 p-2">
                    <Icon className={`w-3.5 h-3.5 ${color} mx-auto mb-1`} />
                    <div className={`text-xs font-bold ${color}`}>{value}</div>
                    <div className="text-[10px] text-muted-foreground">{label}</div>
                  </div>
                ))}
              </div>
              {store.businessType && (
                <div className="mt-3 flex items-center gap-1.5">
                  <div className="h-1 flex-1 rounded-full bg-secondary overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500/60 to-teal-500/60 rounded-full" style={{ width: "60%" }} />
                  </div>
                  <span className="text-[10px] text-muted-foreground">{store.businessType}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => { setSelected(null); setDetail(null); }} />
          <div className="relative w-full max-w-md bg-card border-l border-border/60 flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${avatarColor(String(selected.userId))} flex items-center justify-center text-white text-sm font-bold`}>
                  {getInitials(selected.storeName)}
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">{selected.storeName}</div>
                  <div className="text-[11px] text-muted-foreground">{selected.ownerName}</div>
                </div>
              </div>
              <button onClick={() => { setSelected(null); setDetail(null); }} className="p-2 rounded-lg hover:bg-secondary transition-colors">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {detailLoading ? (
                <div className="space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="h-20 shimmer-loading rounded-xl" />)}</div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-secondary/60 p-3 text-center">
                      <div className="text-lg font-bold text-emerald-400">{formatCurrency(selected.revenue)}</div>
                      <div className="text-[10px] text-muted-foreground">Total Revenue</div>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-3 text-center">
                      <div className="text-lg font-bold text-blue-400">{selected.salesCount}</div>
                      <div className="text-[10px] text-muted-foreground">Total Sales</div>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-3 text-center">
                      <div className="text-lg font-bold text-violet-400">{selected.productCount}</div>
                      <div className="text-[10px] text-muted-foreground">Products</div>
                    </div>
                    <div className="rounded-xl bg-secondary/60 p-3 text-center">
                      <div className="text-lg font-bold text-amber-400">{detail?.aiMemoryCount ?? "—"}</div>
                      <div className="text-[10px] text-muted-foreground">AI Memories</div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border/40 bg-secondary/30 p-4 space-y-2 text-xs">
                    {[
                      { label: "Owner Email",    value: selected.ownerEmail },
                      { label: "Business Type",  value: selected.businessType || "—" },
                      { label: "Currency",       value: selected.currency || "PHP" },
                      { label: "Status",         value: selected.isBanned ? "Suspended" : "Active" },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-foreground font-medium">{value}</span>
                      </div>
                    ))}
                  </div>

                  {detail?.products && detail.products.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-foreground mb-2">Products ({detail.products.length})</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {detail.products.slice(0, 8).map((p) => (
                          <div key={p.id} className="flex items-center justify-between text-xs bg-secondary/40 rounded-lg px-3 py-2">
                            <div>
                              <span className="text-foreground">{p.name}</span>
                              {p.category && <span className="text-muted-foreground ml-2 text-[10px]">{p.category}</span>}
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-400 font-medium">{p.price ? formatCurrency(Number(p.price)) : "—"}</div>
                              {p.stock != null && <div className="text-[10px] text-muted-foreground">stock: {p.stock}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail?.sales && detail.sales.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-foreground mb-2">Recent Sales ({detail.sales.length})</div>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {detail.sales.slice(0, 6).map((s) => (
                          <div key={s.id} className="flex items-center justify-between text-xs bg-secondary/40 rounded-lg px-3 py-2">
                            <div>
                              <span className="text-foreground">{s.itemCount} items</span>
                              <span className="text-muted-foreground ml-2">{s.paymentMethod || "—"}</span>
                            </div>
                            <div className="text-right">
                              <div className="text-emerald-400 font-medium">{s.total ? formatCurrency(Number(s.total)) : "—"}</div>
                              <div className="text-muted-foreground text-[10px]">{formatDate(s.createdAt)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detail?.expenses && detail.expenses.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-foreground mb-2">Expenses ({detail.expenses.length})</div>
                      <div className="space-y-2 max-h-36 overflow-y-auto">
                        {detail.expenses.slice(0, 5).map((e) => (
                          <div key={e.id} className="flex items-center justify-between text-xs bg-secondary/40 rounded-lg px-3 py-2">
                            <span className="text-muted-foreground">{e.description || "—"}</span>
                            <div className="text-right">
                              <div className="text-red-400 font-medium">{e.amount ? formatCurrency(Number(e.amount)) : "—"}</div>
                              <div className="text-[10px] text-muted-foreground">{formatDate(e.createdAt)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="border-t border-border/40 px-5 py-4 flex gap-2">
              <button
                onClick={() => setEditStore(selected)}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Edit Store
              </button>
              <button
                onClick={() => handleSuspend(selected)}
                disabled={actionLoading === selected.userId}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-semibold transition-colors border",
                  selected.isBanned
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20"
                    : "bg-red-500/15 text-red-400 border-red-500/25 hover:bg-red-500/20"
                )}
              >
                {actionLoading === selected.userId
                  ? <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin mx-auto" />
                  : selected.isBanned ? "Unsuspend" : "Suspend"}
              </button>
            </div>
          </div>
        </div>
      )}

      {editStore && (
        <EditStoreDialog
          store={editStore}
          onClose={() => setEditStore(null)}
          onSuccess={(msg) => { showToast(msg, "ok"); setEditStore(null); load(); }}
        />
      )}
    </div>
  );
}
