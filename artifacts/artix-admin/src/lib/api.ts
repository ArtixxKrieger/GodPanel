const BASE_URL = "/api";

let _token: string | null = localStorage.getItem("artix_admin_token");

function getToken(): string | null {
  return _token;
}

function setToken(token: string) {
  _token = token;
  localStorage.setItem("artix_admin_token", token);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    const pw = (import.meta as any).env?.VITE_ADMIN_PASSWORD;
    if (pw) {
      const ok = await silentLogin(pw);
      if (ok) {
        const retryHeaders = { ...headers, Authorization: `Bearer ${getToken()}` };
        const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers: retryHeaders });
        if (retry.ok) return retry.json();
      }
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || err.error || "Request failed");
  }
  return res.json();
}

export async function silentLogin(password: string): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (data.token) { setToken(data.token); return true; }
    return false;
  } catch {
    return false;
  }
}

export interface DashboardData {
  totalUsers: number;
  newSignupsThisWeek: number;
  newSignupsPrevWeek: number;
  bannedUsers: number;
  platformRevenue: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  activeSubscriptions: number;
  freeUsers: number;
  pendingPayments: number;
  totalPosRevenue: number;
  totalPosSales: number;
  activeStores: number;
  recentSignups: { id: string; name: string; email: string; storeName: string; plan: string; createdAt: string | null }[];
  subscriptionBreakdown: { plan: string; count: number }[];
}

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
  plan?: string;
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
  salesCount: number;
  productCount: number;
  isBanned?: boolean;
}

export interface StoreDetail {
  store: StoreSummary;
  products: { id: string | number; name: string; price?: number | null; category?: string | null; stock?: number | null }[];
  sales: { id: string | number; total?: number | null; paymentMethod?: string | null; createdAt?: string | null; itemCount: number }[];
  expenses: { id: string | number; description?: string | null; amount?: number | null; createdAt?: string | null }[];
  aiMemoryCount: number;
}

export interface AiUsageEntry {
  userId: string;
  tenantId?: string;
  storeName: string;
  memoryCount: number;
  lastActivity?: string | null;
}

export interface RevenueData {
  data: { date: string; revenue: number; sales: number }[];
  totalRevenue: number;
  totalSales: number;
  averageOrderValue: number;
}

export interface TopStore {
  userId: string;
  storeName: string;
  revenue: number;
  salesCount: number;
  businessType?: string | null;
}

export const api = {
  health: () => request<{ status: string }>("/healthz"),
  me: () => request<{ admin: boolean; iat: number }>("/admin/me"),
  dashboard: () => request<DashboardData>("/admin/dashboard"),
  users: (params?: { search?: string; role?: string; banned?: boolean }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set("search", params.search);
    if (params?.role) q.set("role", params.role);
    if (params?.banned !== undefined) q.set("banned", String(params.banned));
    return request<AdminUser[]>(`/admin/users${q.toString() ? `?${q}` : ""}`);
  },
  banUser: (userId: string) => request<{ success: boolean; message: string }>(`/admin/users/${userId}/ban`, { method: "POST" }),
  unbanUser: (userId: string) => request<{ success: boolean; message: string }>(`/admin/users/${userId}/unban`, { method: "POST" }),
  setUserPlan: (userId: string, plan: string) => request<{ success: boolean; message: string }>(`/admin/users/${userId}/set-plan`, { method: "POST", body: JSON.stringify({ plan }) }),
  revenue: (period: "7d" | "30d" | "90d" | "1y" = "30d") =>
    request<RevenueData>(`/admin/revenue?period=${period}`),
  topStores: () => request<TopStore[]>("/admin/revenue/top-stores"),
  stores: () => request<StoreSummary[]>("/admin/stores"),
  storeDetail: (userId: string) => request<StoreDetail>(`/admin/stores/${userId}`),
  aiUsage: () => request<AiUsageEntry[]>("/admin/ai-usage"),
};
