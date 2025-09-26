/**
 * Hook לשליפת נתוני המשתמש הנוכחי
 * משתמש ב-React Query לקאשינג וניהול מצב
 */
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';

/**
 * שולף את נתוני המשתמש הנוכחי מה-API
 * @returns {QueryResult} תוצאת React Query עם נתוני המשתמש
 */
export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data } = await api.get('/api/auth/me');
      // אפשרות: איחוד שדות אם ה־API מחזיר פורמט מעט שונה
      return {
        id: data.id,
        email: data.email,
        full_name: data.full_name || data.name,
        roles: data.roles || (data.role ? [data.role] : []),
        family_id: data.family_id ?? null,
        family_role: data.family_role,
        hebrew_name: data.hebrew_name || data.full_name || 'משתמש',
      };
    },
    staleTime: 5 * 60_000, // 5 דקות - נתוני משתמש יציבים
    retry: 1, // נסיון אחד בלבד - אם נכשל, כנראה לא מחובר
  });
};