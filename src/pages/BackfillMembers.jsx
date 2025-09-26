/**
 * BackfillMembers.jsx - כלי עזר למיגרציה של Users ו-Children ל-Members
 * נסתר מהממשק הרגיל, נועד להרצה חד-פעמית למשפחות קיימות
 */
import React from 'react';
import { entities } from '@/components/lib/base44';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { isSuperAdminEmail } from '@/components/lib/authz';

export default function BackfillMembers() {
  const { user } = useFamilyContext();
  
  // מוסתר למשתמשים רגילים
  if (!isSuperAdminEmail(user.email)) {
    return null;
  }

  async function runBackfill() {
    if (!confirm('האם אתה בטוח שברצונך להריץ Backfill? זה ייצור Member records למשתמשים ולילדים שחסרים.')) {
      return;
    }

    try {
      const fid = user.family_id;
      if (!fid) {
        alert('אין family_id למשתמש הנוכחי');
        return;
      }

      let usersProcessed = 0;
      let childrenProcessed = 0;
      
      // עיבוד משתמשים
      const users = await entities.list('User', { family_id: fid, limit: 500 });
      
      for (const u of users) {
        try {
          // בדיקה אם כבר יש Member
          const found = await entities.list('Member', { 
            family_id: fid, 
            user_id: u.id, 
            limit: 1 
          });
          
          if (found[0]) continue; // כבר קיים
          
          // יצירת Member חדש
          const m = await entities.create('Member', {
            family_id: fid, 
            role: u.family_role || 'parent',
            hebrew_name: u.hebrew_name || (u.email || '').split('@')[0],
            user_id: u.id, 
            is_active: true,
            color: u.family_role === 'parent' ? '#3b82f6' : '#8b5cf6'
          });
          
          // עדכון הקישור ב-User אם חסר
          if (!u.member_id) {
            await entities.update('User', u.id, { member_id: m.id });
          }
          
          usersProcessed++;
        } catch (e) { 
          console.warn('backfill user→member failed', u.email, e); 
        }
      }
      
      // עיבוד ילדים
      const children = await entities.list('Child', { family_id: fid, limit: 500 });
      
      for (const c of children) {
        try {
          if (c.member_id) continue; // כבר יש Member
          
          // יצירת Member עבור הילד
          const m = await entities.create('Member', {
            family_id: fid, 
            role: 'child',
            hebrew_name: c.hebrew_name || c.name || 'ילד/ה',
            color: c.color || '#f59e0b', // צהוב לילדים
            is_active: true
          });
          
          // קישור ה-Member ל-Child
          await entities.update('Child', c.id, { member_id: m.id });
          
          childrenProcessed++;
        } catch (e) { 
          console.warn('backfill child→member failed', c.id, e); 
        }
      }
      
      alert(`Backfill completed!\nUsers processed: ${usersProcessed}\nChildren processed: ${childrenProcessed}`);
    } catch (error) {
      console.error('Backfill failed:', error);
      alert('Backfill נכשל. בדוק את הקונסול לפרטים.');
    }
  }

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl" dir="rtl">
      <h3 className="text-lg font-semibold text-yellow-800 mb-4">כלי מיגרציה למפתחים</h3>
      <p className="text-sm text-yellow-700 mb-4">
        כלי זה ייצור Member records עבור משתמשים וילדים שחסרים. 
        השתמש בזהירות ורק לאחר גיבוי הנתונים.
      </p>
      <button 
        onClick={runBackfill}
        className="px-4 py-2 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700"
      >
        הרץ Backfill Members
      </button>
    </div>
  );
}