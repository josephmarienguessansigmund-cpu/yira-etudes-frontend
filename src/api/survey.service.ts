import { apiFetch } from './client';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const register = (nom: string, email: string, password: string) =>
  apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ nom, email_contact: email, password }),
  });

export const login = (email: string, password: string) =>
  apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email_contact: email, password }),
  });

export const getMe = () => apiFetch('/auth/me');

// ─── Dashboard ────────────────────────────────────────────────────────────────

export const getDashboardHome = () => apiFetch('/dashboard/home');

export const listEnquetes = (page = 1, limit = 20) =>
  apiFetch(`/dashboard/enquetes?page=${page}&limit=${limit}`);

export const getEnqueteDetail = (id: string) =>
  apiFetch(`/dashboard/enquetes/${id}`);

export const exportResultats = (enqueteId: string, format: 'csv' | 'json' = 'csv') =>
  apiFetch(`/dashboard/export?enquete_id=${enqueteId}&format=${format}`);

// ─── Surveys ──────────────────────────────────────────────────────────────────

export const createTemplate = (payload: {
  titre: string;
  description?: string;
  country_code?: string;
  questions: {
    ordre: number;
    label: string;
    type: string;
    is_required: boolean;
    options?: string[];
  }[];
}) =>
  apiFetch('/surveys/templates', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const submitSurvey = (
  enqueteId: string,
  data: Record<string, any>,
  canal = 'web',
) =>
  apiFetch(`/surveys/${enqueteId}/submit`, {
    method: 'POST',
    body: JSON.stringify({ data, canal }),
  });

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getAnalytics = (enqueteId: string) =>
  apiFetch(`/analytics/enquetes/${enqueteId}`);