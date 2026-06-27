const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function fetchAPI<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `API error: ${res.status}`);
  }

  return res.json();
}

// Tools
export interface ToolDTO {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  pricing?: string;
  price?: number;
  rating?: number;
  categories?: string[];
  featured?: boolean;
}

export const toolsAPI = {
  list: async (params?: { category?: string; search?: string; limit?: number; offset?: number }) => {
    const sp = new URLSearchParams();
    if (params?.category) sp.set('category', params.category);
    if (params?.search) sp.set('search', params.search);
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.offset) sp.set('offset', String(params.offset));
    const q = sp.toString();
    return fetchAPI<{ data: { tools: ToolDTO[]; total: number } }>(`/api/v1/tools${q ? '?' + q : ''}`);
  },
  create: async (data: ToolDTO) =>
    fetchAPI<{ data: ToolDTO }>('/api/v1/tools', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<ToolDTO>) =>
    fetchAPI<{ data: ToolDTO }>(`/api/v1/tools/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) =>
    fetchAPI<void>(`/api/v1/tools/${id}`, { method: 'DELETE' }),
};

// Tasks
export interface TaskDTO {
  id?: string;
  title: string;
  description?: string;
  difficulty?: string;
  category?: string;
  toolCount?: number;
  output?: string;
  featured?: boolean;
}

export const tasksAPI = {
  list: async () => {
    const res = await fetchAPI<{ data: { tasks: TaskDTO[]; total: number } }>('/api/v1/tasks');
    return { data: res.data.tasks, total: res.data.total };
  },
  create: async (data: TaskDTO) =>
    fetchAPI<{ data: TaskDTO }>('/api/v1/tasks', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<TaskDTO>) =>
    fetchAPI<{ data: TaskDTO }>(`/api/v1/tasks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) =>
    fetchAPI<void>(`/api/v1/tasks/${id}`, { method: 'DELETE' }),
};

// Workflows
export interface WorkflowDTO {
  id?: string;
  name: string;
  description?: string;
  nodes?: any[];
  edges?: any[];
  isTemplate?: boolean;
  featured?: boolean;
}

export const workflowsAPI = {
  list: async () => {
    const res = await fetchAPI<{ data: { workflows: WorkflowDTO[]; total: number } }>('/api/v1/workflows');
    return { data: res.data.workflows, total: res.data.total };
  },
  create: async (data: WorkflowDTO) =>
    fetchAPI<{ data: WorkflowDTO }>('/api/v1/workflows', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<WorkflowDTO>) =>
    fetchAPI<{ data: WorkflowDTO }>(`/api/v1/workflows/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) =>
    fetchAPI<void>(`/api/v1/workflows/${id}`, { method: 'DELETE' }),
};

// Articles
export interface ArticleDTO {
  id?: string;
  title: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  category?: string;
  published?: boolean;
  featured?: boolean;
}

export const articlesAPI = {
  list: async () => {
    const res = await fetchAPI<{ data: { articles: ArticleDTO[]; total: number } }>('/api/v1/articles');
    return { data: res.data.articles, total: res.data.total };
  },
  create: async (data: ArticleDTO) =>
    fetchAPI<{ data: ArticleDTO }>('/api/v1/articles', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: Partial<ArticleDTO>) =>
    fetchAPI<{ data: ArticleDTO }>(`/api/v1/articles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: async (id: string) =>
    fetchAPI<void>(`/api/v1/articles/${id}`, { method: 'DELETE' }),
  publish: async (id: string) =>
    fetchAPI<{ data: ArticleDTO }>(`/api/v1/articles/${id}/publish`, { method: 'POST' }),
};
