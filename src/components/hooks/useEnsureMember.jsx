/**
 * useEnsureMember.js - וידוא שיש Member record עבור המשתמש
 * פועל ברקע ללא חסימת UI, יוצר Member אוטומטית אם חסר
 */
import { useEffect } from 'react';
import { entities } from '@/components/lib/base44';
import { useCurrentUser } from '@/components/hooks/useCurrentUser';

export function useEnsureMember() {
  const { data: user } = useCurrentUser();
  
  useEffect(() => {
    if (!user?.family_id || user.member_id) return;
    
    (async () => {
      try {
        // נסה למצוא Member קיים לפי user_id
        const rows = await entities.list('Member', { 
          family_id: user.family_id, 
          user_id: user.id, 
          limit: 1 
        });
        
        if (rows?.[0]) {
          // אם נמצא Member קיים, קשר אותו למשתמש
          await entities.update('User', 'me', { member_id: rows[0].id });
          return;
        }
        
        // צור Member חדש (להורה/סבא ברירת מחדל)
        const m = await entities.create('Member', {
          family_id: user.family_id,
          role: user.family_role || 'parent',
          hebrew_name: user.hebrew_name || (user.email || '').split('@')[0],
          user_id: user.id,
          is_active: true,
          color: user.family_role === 'parent' ? '#3b82f6' : '#8b5cf6', // כחול להורים, סגול לאחרים
        });
        
        // עדכן את המשתמש עם הקישור ל-Member
        await entities.update('User', 'me', { member_id: m.id });
        
        console.log('[ensureMember] Created member for user:', user.email);
      } catch (e) {
        console.warn('[ensureMember] failed', e);
        // לא זורקים שגיאה - זה לא צריך לחסום את ה-UI
      }
    })();
  }, [user?.id, user?.family_id, user?.member_id, user?.family_role, user?.hebrew_name, user?.email]);
}