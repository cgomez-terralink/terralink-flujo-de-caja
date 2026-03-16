const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";

function getToken(): string | null {
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Error ${res.status}`);
  }
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, data?: unknown) =>
    request<T>(path, { method: "POST", body: data ? JSON.stringify(data) : undefined }),
  put: <T>(path: string, data: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(data) }),
};

// Auth
export interface LoginPayload {
  email: string;
  password: string;
}
export interface User {
  id: number;
  email: string;
  name: string;
  initials: string;
  role: string;
}
export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export const authApi = {
  login: (data: LoginPayload) => api.post<TokenResponse>("/auth/login", data),
};

// Banks
export interface Bank {
  id: number;
  name: string;
  short_name: string;
  account_number: string | null;
  currency: string;
}

export const bankApi = {
  list: () => api.get<Bank[]>("/banks/"),
  seed: () => api.post("/banks/seed"),
};

// Movements
export interface Movement {
  id: number;
  movement_type: string;
  bank_id: number;
  bank_name: string | null;
  provider: string | null;
  date: string;
  cashflow_amount: number;
  status: string | null;
  concept: string | null;
  business_center: string | null;
  month_year: string | null;
  year: number | null;
  group1_cashflow: string | null;
  group2_cashflow: string | null;
  invoice: string | null;
  document: string | null;
  source: string;
}

export interface CashflowSummary {
  period: string;
  total_inflows: number;
  total_outflows: number;
  net: number;
  movement_count: number;
}

export interface BankSummary {
  bank_id: number;
  bank_name: string;
  total_inflows: number;
  total_outflows: number;
  net: number;
  movement_count: number;
}

export interface FilterOptions {
  banks: { id: number; name: string }[];
  years: number[];
  statuses: string[];
  business_centers: string[];
  groups_cashflow: string[];
}

export const movementApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return api.get<Movement[]>(`/movements/${qs}`);
  },
  summaryByPeriod: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return api.get<CashflowSummary[]>(`/movements/summary/by-period${qs}`);
  },
  summaryByBank: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return api.get<BankSummary[]>(`/movements/summary/by-bank${qs}`);
  },
  filters: () => api.get<FilterOptions>("/movements/filters"),
};

// Cartolas
export interface CartolaEntry {
  id: number;
  bank_id: number;
  bank_name: string | null;
  date: string;
  document: string | null;
  description: string | null;
  debit: number;
  credit: number;
  balance: number | null;
  movement_id: number | null;
}

export interface ReconciliationSummary {
  total_entries: number;
  reconciled: number;
  pending: number;
  auto_matched: number;
  manual_matched: number;
  reconciliation_rate: number;
}

export const cartolaApi = {
  list: (params?: Record<string, string | number>) => {
    const qs = params ? "?" + new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null).map(([k, v]) => [k, String(v)])
    ).toString() : "";
    return api.get<CartolaEntry[]>(`/cartolas/${qs}`);
  },
  reconciliationSummary: (bankId?: number) => {
    const qs = bankId ? `?bank_id=${bankId}` : "";
    return api.get<ReconciliationSummary>(`/cartolas/reconciliation/summary${qs}`);
  },
};
