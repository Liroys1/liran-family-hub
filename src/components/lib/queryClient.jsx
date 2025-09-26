import { QueryClient } from '@tanstack/react-query';

/**
 * פונקציית backoff אקספוננציאלית - מגדילה את זמן ההמתנה בין ניסיונות
 * @param {number} attempt - מספר הניסיון הנוכחי
 * @returns {number} זמן המתנה במילישניות
 */
function backoff(attempt) {
  const base = 500;
  return Math.min(8000, base * Math.pow(2, attempt));
}

/**
 * QueryClient מוכן עם הגדרות אופטימליות לאפליקציה
 * - retry logic חכמה (לא מנסה שוב על 401/403/404)
 * - backoff אקספוננציאלי
 * - cache management חכם
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (count, err) => {
        const s = err?.response?.status || err?.status;
        if (s === 401 || s === 403 || s === 404) return false;
        return count < 3;
      },
      retryDelay: (attempt, err) => {
        const ra = err?.response?.headers?.['retry-after'];
        const n = Number(ra);
        return Number.isFinite(n) ? n * 1000 : backoff(attempt);
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 60_000, // דקה אחת
      gcTime: 30 * 60_000, // 30 דקות
    },
    mutations: { retry: 1 },
  },
});

export default queryClient;