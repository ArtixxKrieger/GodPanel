const BASE_URL = "https://artix-pos.vercel.app/api";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || "Request failed");
  }
  return res.json();
}

export const api = {
  health: () => request<{ status: string; uptime: number; ts: string; services: Record<string, { status: string; latencyMs: number }> }>("/health"),
  me: () => request<{ admin: boolean; iat: number }>("/admin/me"),
  dashboard: () => request<{
    totalUsers: string;
    totalRevenue: number;
    newSignupsThisWeek: string;
    activeStores: string;
    totalSales: string;
    totalExpenses: number;
    bannedUsers: string;
    revenueThisMonth: number;
  }>("/admin/dashboard"),
  users: (params?: { search?: string; role?: string; banned?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.role) q.set("role", params.role);
    if (params?.banned !== undefined) q.set("banned", String(params.banned));
    return request<AdminUser[]>(`/admin/users${q.toString() ? `?${q}` : ""}`);
  },
  banUser: (userId: string) => request<{ success: boolean; message: string }>(`/admin/users/${userId}/ban`, { method: "POST" }),
  unbanUser: (userId: string) => request<{ success: boolean; message: string }>(`/admin/users/${userId}/unban`, { method: "POST" }),
  revenue: (period: "7d" | "30d" | "90d" | "1y" = "30d") => request<{
    data: { date: string; revenue: number; sales: string }[];
    totalRevenue: number;
    totalSales: string;
    averageOrderValue: number;
  }>(`/admin/revenue?period=${period}`),
  topStores: () => request<{ userId: string; storeName: string; revenue: number; salesCount: string; businessType?: string }[]>("/admin/revenue/top-stores"),
  stores: () => request<StoreSummary[]>("/admin/stores"),
  storeDetail: (userId: string) => request<StoreDetail>(`/admin/stores/${userId}`),
  aiUsage: () => request<{ userId: string; tenantId?: string; storeName: string; memoryCount: string; lastActivity?: string }[]>("/admin/ai-usage"),
};

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  isBanned?: boolean;
  createdAt?: string;
  storeName?: string;
  businessType?: string;
  revenueTotal: number;
  lastActive?: string;
}

export interface StoreSummary {
  userId: string;
  storeName: string;
  ownerName: string;
  ownerEmail: string;
  businessType?: string;
  currency?: string;
  revenue: number;
  salesCount: string;
  productCount: string;
  isBanned?: boolean;
}

export interface StoreDetail {
  store: StoreSummary;
  products: { id: string; name: string; price?: number; category?: string; stock?: string }[];
  sales: { id: string; total?: number; paymentMethod?: string; createdAt?: string; itemCount: string }[];
  expenses: { id: string; description?: string; amount?: number; createdAt?: string }[];
  aiMemoryCount: string;
}
