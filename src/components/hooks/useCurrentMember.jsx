/**
 * Hook לשליפת המידע המלא של החבר הנוכחי במשפחה (Member entity)
 */
import { useQuery } from '@tanstack/react-query';
import { Member } from '@/api/entities';

/**
 * שולף את נתוני ה-Member על סמך ה-user.id וה-family_id.
 * אם המשתמש הוא חלק מכמה משפחות, זה ימצא את ה-Member הנכון למשפחה הנוכחית.
 * @param {string} userId - מזהה המשתמש מה-User entity
 * @param {string} familyId - מזהה המשפחה הנוכחית
 * @returns {QueryResult} תוצאת React Query עם נתוני ה-Member
 */
export const useCurrentMember = (userId, familyId) => {
  return useQuery({ 
    queryKey: ['currentMember', userId, familyId], 
    queryFn: async () => {
      if (!userId || !familyId) return null;
      // נחפש את החבר במשפחה שמשויך למזהה המשתמש הנוכחי
      const members = await Member.filter({ user_id: userId, family_id: familyId });
      return members?.[0] || null; // החזר את החבר הראשון שנמצא או null
    },
    enabled: !!userId && !!familyId, // רק אם יש userId ו-familyId
    staleTime: 5 * 60 * 1000, // 5 דקות
  });
};