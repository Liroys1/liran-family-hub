/**
 * Join.jsx - עמוד לטיפול בקישורי הזמנה (Invite Links)
 * קורא את הטוקן מפרמטר ה-URL ומנסה לצרף את המשתמש למשפחה באמצעות InviteClaim.
 */
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { entities } from '@/components/lib/base44';
import { Loader2, AlertCircle } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function Join() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('מאמת את ההזמנה שלך...');

  useEffect(() => {
    async function claimInvite() {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('קישור ההזמנה אינו תקין או חסר טוקן.');
          return;
        }

        setMessage('מצטרף למשפחה, רגע...');
        
        const result = await entities.create('InviteClaim', { token });
        
        // Assuming the backend returns the family_id upon successful claim
        if (result && result.family_id) {
          setMessage('הצטרפת בהצלחה! מעביר אותך לדשבורד...');
          navigate(createPageUrl('Dashboard'), { 
            replace: true, 
            state: { familyId: result.family_id } 
          });
        } else {
            // Fallback if family_id is not returned directly, maybe refresh user data
            setMessage('הצטרפת! מרענן נתונים...');
            window.location.href = createPageUrl('Dashboard');
        }

      } catch (e) {
        console.error('Join error:', e);
        setError(e?.response?.data?.error || 'ההצטרפות נכשלה. ודא שהינך מחובר ונסה שוב.');
      }
    }
    
    claimInvite();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen grid place-items-center p-6 text-center bg-gray-50" dir="rtl">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        {error ? (
          <div className="space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="text-xl font-bold text-red-700">שגיאה בהצטרפות</h2>
            <p className="text-slate-600">{error}</p>
            <div className="space-y-2">
               <a 
                href={createPageUrl('Dashboard')} 
                className="block w-full px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
              >
                חזרה לדשבורד
              </a>
              <a 
                href={createPageUrl('FamilySetup')} 
                className="block w-full px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50"
              >
                הקמת משפחה חדשה
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
            <h2 className="text-xl font-bold">{message}</h2>
            <p className="text-slate-500">אנא המתן בזמן שאנו מעבדים את בקשת ההצטרפות שלך</p>
          </div>
        )}
      </div>
    </div>
  );
}