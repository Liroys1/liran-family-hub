
// src/components/lib/api.js
export async function api(path, { method = 'GET', params, body, headers } = {}) {
  const url = new URL(path, window.location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method,
    credentials: 'include',           // חשוב! שולח Cookie אחרי login
    headers: {
      'Content-Type': 'application/json',
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // אם אין סשן – נשלח להתחבר, ואז נחזור בדיוק לאן שהיינו
  if (res.status === 401) {
    const from = encodeURIComponent(window.location.href);
    window.location.replace(`/login?from_url=${from}`); // שים לב: login ולא auth
    throw new Error('unauthorized');
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`api error ${res.status}: ${text || res.statusText}`);
  }
  // נסה JSON, ואם אין — החזר טקסט
  const ct = res.headers.get('content-type') || '';
  return ct.includes('application/json') ? res.json() : res.text();
}

// נקודת בדיקת משתמש/סשן
export async function getMe() {
  // ב-Base44 קיים /api/auth/me; השורות הבאות תומכות גם בווריאנטים שהופיעו אצלך
  try { return await api('/api/auth/me'); } catch (e) { throw e; }
}

export async function getUser() {
  // חלק מהמקרים אצלך ניסו /api/entities/User/me או /api/user/me — ננסה חלופות
  try { return await api('/api/entities/User/me'); } catch {}
  try { return await api('/api/user/me'); } catch {}
  // כבר עשינו redirect ב-401; אם עדיין אין, נזרוק
  throw new Error('no-user');
}
