/**
 * Hook לשליפת נתוני משפחה
 * משתמש ב-React Query לקאשינג וניהול מצב
 */
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/components/lib/base44';

/**
 * שולף את נתוני המשפחה לפי ID
 * @param {string} familyId - מזהה המשפחה
 * @returns {QueryResult} תוצאת React Query עם נתוני המשפחה
 */
export const useFamily = (familyId) => {
  return useQuery({ 
    queryKey: ['family', familyId], 
    queryFn: () => entities.get('Family', familyId), 
    enabled: !!familyId, // רק אם יש familyId
    staleTime: 5 * 60 * 1000, // 5 דקות - נתוני משפחה יציבים
  });
};