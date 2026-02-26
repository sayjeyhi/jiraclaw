const BASE = "/api";

export const fetcher = (url: string) => fetch(url).then((r) => r.json());

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  return res.json();
}

// ---- Auth / Users ----
export const api = {
  auth: {
    me: () => request("/auth/me"),
    getUsers: () => request("/auth/users"),
    createUser: (body: Record<string, unknown>) =>
      request("/auth/users", { method: "POST", body: JSON.stringify(body) }),
    updateUser: (id: string, body: Record<string, unknown>) =>
      request(`/auth/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteUser: (id: string) => request(`/auth/users/${id}`, { method: "DELETE" }),
  },

  // ---- Bots ----
  bots: {
    list: () => request("/bots"),
    get: (id: string) => request(`/bots/${id}`),
    tickets: (id: string) => request(`/bots/${id}/tickets`),
    create: (body: Record<string, unknown>) =>
      request("/bots", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      request(`/bots/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/bots/${id}`, { method: "DELETE" }),
  },

  // ---- Jira ----
  jira: {
    list: () => request("/jira"),
    get: (id: string) => request(`/jira/${id}`),
    create: (body: Record<string, unknown>) =>
      request("/jira", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      request(`/jira/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/jira/${id}`, { method: "DELETE" }),
  },

  // ---- AI Models / Providers ----
  aiModels: {
    list: () => request("/ai-models"),
    get: (id: string) => request(`/ai-models/${id}`),
    update: (id: string, body: Record<string, unknown>) =>
      request(`/ai-models/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  },

  // ---- Prompts ----
  prompts: {
    list: () => request("/prompts"),
    get: (id: string) => request(`/prompts/${id}`),
    create: (body: Record<string, unknown>) =>
      request("/prompts", { method: "POST", body: JSON.stringify(body) }),
    update: (id: string, body: Record<string, unknown>) =>
      request(`/prompts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    delete: (id: string) => request(`/prompts/${id}`, { method: "DELETE" }),
  },

  // ---- Channels ----
  channels: {
    list: () => request("/channels"),
    get: (id: string) => request(`/channels/${id}`),
    update: (id: string, body: Record<string, unknown>) =>
      request(`/channels/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  },

  // ---- Logs ----
  logs: {
    list: (params?: Record<string, string>) => {
      const qs = params ? "?" + new URLSearchParams(params).toString() : "";
      return request(`/logs${qs}`);
    },
  },
};
