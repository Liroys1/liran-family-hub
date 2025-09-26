
import { getRuntimeFlags } from './runtimeFlags';

export async function apiFetch(path, options = {}) {
  const url = `/api${path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    const err = new Error(`HTTP ${res.status} ${res.statusText} on ${path} :: ${text}`);
    err.status = res.status;
    throw err;
  }
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : null;
}

export async function getCurrentUser() {
  const flags = getRuntimeFlags();
  // 1) ניסיונות API "אמיתיים"
  const endpoints = ['/auth/me', '/entities/User/me', '/user/me'];
  for (const ep of endpoints) {
    try {
      const u = await apiFetch(ep);
      if (u && u.email) return u;
    } catch (e) {
      if (e?.status === 401 || e?.status === 404) continue;
      // שאר השגיאות – נמשיך לפאלבק אם בפריוויו
    }
  }
  // 2) PREVIEW fallback
  if (flags.isPreview) {
    const email = localStorage.getItem('debug.email') || 'liroys1@gmail.com';
    const role = localStorage.getItem('debug.family_role') || 'super_admin';
    const family_id = localStorage.getItem('debug.family_id') || null;
    return { id: 'me', email, role, family_id, family_role: role, hebrew_name: 'Preview User' };
  }
  return null;
}

export const entities = {
  async list(entity, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/entities/${entity}${qs ? `?${qs}` : ''}`);
  },
  async get(entity, id, params = {}) {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`/entities/${entity}/${id}${qs ? `?${qs}` : ''}`);
  },
  async create(entity, payload) {
    return apiFetch(`/entities/${entity}`, { method: 'POST', body: JSON.stringify(payload) });
  },
  async update(entity, id, payload) {
    return apiFetch(`/entities/${entity}/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  },
  async remove(entity, id) {
    return apiFetch(`/entities/${entity}/${id}`, { method: 'DELETE' });
  },
};
