const BASE = "/api";

export const fetcher = (url: string) =>
  fetch(url).then(async (r) => {
    if (!r.ok) throw new Error((await r.text()) || r.statusText);
    const text = await r.text();
    if (!text?.trim()) return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  });

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...options?.headers },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || res.statusText);
  }
  const text = await res.text();
  if (!text?.trim()) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    return undefined as T;
  }
}

const w = (workspaceId: string) => `/w/${workspaceId}`;

// ---- Auth / Users (not workspace-scoped) ----
export const api = {
  auth: {
    getUsers: () => request("/admin/users"),
    createUser: (body: Record<string, unknown>) =>
      request("/admin/users", { method: "POST", body: JSON.stringify(body) }),
    updateUser: (id: string, body: Record<string, unknown>) =>
      request(`/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    deleteUser: (id: string) =>
      request(`/admin/users/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/octet-stream",
        },
      }),
  },

  skills: {
    search: (q?: string) => request(`/skills${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  },

  workspaces: {
    list: () => request("/workspaces"),
    get: (id: string) => request(`/workspaces/${id}`),
    create: (body: { name: string; slug: string }) =>
      request("/workspaces", { method: "POST", body: JSON.stringify(body) }),
  },

  // Workspace-scoped API - pass workspaceId
  forWorkspace: (workspaceId: string) => ({
    bots: {
      list: () => request(`${w(workspaceId)}/bots`),
      get: (id: string) => request(`${w(workspaceId)}/bots/${id}`),
      tickets: (id: string) => request(`${w(workspaceId)}/bots/${id}/tickets`),
      create: (body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/bots`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id: string, body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/bots/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
      updateSkills: (id: string, skills: string[]) =>
        request(`${w(workspaceId)}/bots/${id}/skills`, {
          method: "PATCH",
          body: JSON.stringify({ skills }),
        }),
      delete: (id: string) =>
        request(`${w(workspaceId)}/bots/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }),
    },
    jira: {
      list: () => request(`${w(workspaceId)}/jira`),
      get: (id: string) => request(`${w(workspaceId)}/jira/${id}`),
      create: (body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/jira`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id: string, body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/jira/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
      delete: (id: string) =>
        request(`${w(workspaceId)}/jira/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }),
    },
    aiModels: {
      list: () => request(`${w(workspaceId)}/ai-models`),
      get: (id: string) => request(`${w(workspaceId)}/ai-models/${id}`),
      create: (body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/ai-models`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id: string, body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/ai-models/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
    },
    prompts: {
      list: () => request(`${w(workspaceId)}/prompts`),
      get: (id: string) => request(`${w(workspaceId)}/prompts/${id}`),
      create: (body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/prompts`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id: string, body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/prompts/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
      delete: (id: string) =>
        request(`${w(workspaceId)}/prompts/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/octet-stream",
          },
        }),
    },
    channels: {
      list: () => request(`${w(workspaceId)}/channels`),
      get: (id: string) => request(`${w(workspaceId)}/channels/${id}`),
      create: (body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/channels`, {
          method: "POST",
          body: JSON.stringify(body),
        }),
      update: (id: string, body: Record<string, unknown>) =>
        request(`${w(workspaceId)}/channels/${id}`, {
          method: "PUT",
          body: JSON.stringify(body),
        }),
    },
    logs: {
      list: (params?: Record<string, string>) => {
        const qs = params ? "?" + new URLSearchParams(params).toString() : "";
        return request(`${w(workspaceId)}/logs${qs}`);
      },
    },
    memberships: {
      list: () => request(`${w(workspaceId)}/memberships`),
    },
  }),
};
