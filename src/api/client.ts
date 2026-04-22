const API_BASE =
  import.meta.env.VITE_API_URL ||
  'https://yira-etudes-platform-production.up.railway.app/api/v1';

export const apiUrl = (path: string) => `${API_BASE}${path}`;

export const getToken = (): string | null =>
  localStorage.getItem('yira_token');

export const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken() ?? ''}`,
});

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  const res = await fetch(apiUrl(path), {
    ...options,
    headers: { ...authHeaders(), ...(options.headers ?? {}) },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.message ?? `Erreur ${res.status}`);
  }

  return data;
};