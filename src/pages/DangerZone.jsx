/**
 * DangerZone.jsx - אזור מסוכן למחיקת/איפוס משפחה
 * נגיש רק להורים, מנהלים וסופר-אדמינים עם אישור כפול
 */
import React, { useState } from 'react';
import { entities } from '@/components/lib/base44';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { isSuperAdminEmail } from '@/components/lib/authz';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function DangerZone() {
  const { user, family } = useFamilyContext();
  const [confirm, setConfirm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // בדיקת הרשאות
  const hasPermission = (
    isSuperAdminEmail(user.email) || 
    user.family_role === 'admin' || 
    user.family_role === 'parent'
  );

  if (!hasPermission) {
    return null; // לא מציגים כלל למשתמשים ללא הרשאה
  }

  async function wipeFamily() {
    if (confirm !== family?.name) { 
      alert('הקלד/י את שם המשפחה במדויק כדי לאשר'); 
      return; 
    }

    if (!window.confirm('האם אתה בטוח לחלוטין? פעולה זו אינה ניתנת לביטול!')) {
      return;
    }

    setIsProcessing(true);
    
    try {
      // סימון המשפחה כארכיון (מחיקה לוגית)
      await entities.update('Family', family.id, { 
        is_archived: true,
        archived_at: new Date().toISOString()
      });
      
      // ניתוק המשתמש מהמשפחה
      await entities.update('User', 'me', { 
        family_id: null,
        member_id: null
      });
      
      alert('המשפחה סומנה כארכיון בהצלחה. אתה מועבר להקמת משפחה חדשה.');
      
      // הפנייה להקמת משפחה חדשה
      navigate(createPageUrl('FamilySetup'), { replace: true });
      
    } catch (e) { 
      console.error('Family wipe failed:', e);
      alert('נכשל בארכוב המשפחה: ' + (e.message || 'שגיאה לא ידועה'));
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="bg-red-50 border border-red-300 rounded-xl p-6 space-y-4" dir="rtl">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-6 w-6 text-red-600" />
        <h3 className="text-lg font-semibold text-red-800">אזור מסוכן</h3>
      </div>
      
      <div className="space-y-2">
        <p className="text-sm text-red-700">
          פעולה זו תמחק את כל נתוני המשפחה ללא אפשרות שחזור.
        </p>
        <p className="text-sm text-red-600 font-medium">
          כל הנתונים - משימות, אירועים, פרופילי ילדים - יימחקו לצמיתות.
        </p>
      </div>
      
      <div className="space-y-3">
        <label className="block text-sm font-medium text-red-800">
          הקלד/י את שם המשפחה "<strong>{family?.name}</strong>" לאישור:
        </label>
        <input 
          className="border border-red-300 rounded-xl p-3 w-full focus:ring-2 focus:ring-red-500 focus:border-red-500" 
          value={confirm} 
          onChange={e => setConfirm(e.target.value)}
          placeholder={family?.name}
          disabled={isProcessing}
        />
        
        <button 
          onClick={wipeFamily}
          disabled={confirm !== family?.name || isProcessing}
          className="w-full px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? 'מעבד...' : 'מחק משפחה לצמיתות'}
        </button>
      </div>
      
      <p className="text-xs text-red-600">
        * פעולה זו מיועדת למפתחים ולבדיקות בלבד. השתמש בזהירות רבה.
      </p>
    </div>
  );
}