const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000';

export interface Task {
  id: string;
  title: string;
  isCompleted: boolean;
  createdAt: string;
  source: 'manual' | 'ai';
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).message ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  getTasks: () => request<Task[]>('/tasks'),
  createTask: (title: string) =>
    request<Task>('/tasks', { method: 'POST', body: JSON.stringify({ title }) }),
  updateTask: (id: string, data: Partial<Pick<Task, 'title' | 'isCompleted'>>) =>
    request<Task>(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteTask: (id: string) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
  generateTasks: (goal: string, apiKey?: string) =>
    request<Task[]>('/tasks/generate', {
      method: 'POST',
      body: JSON.stringify({ goal }),
      ...(apiKey ? { headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey } } : {}),
    }),
};
