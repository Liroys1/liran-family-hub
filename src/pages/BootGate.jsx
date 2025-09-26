// src/pages/BootGate.jsx
import { useEffect, useState } from 'react';
import { api, getMe, getUser } from '../components/lib/api';

export default function BootGate() {
  const [msg, setMsg] = useState('בודק הרשאות…');

  useEffect(() => {
    (async () => {
      try {
        // 1) אם אין סשן נקבל 401 וה-api ידאג להפניה ל-/login
        const me = await getMe().catch(async () => await getUser());

        // 2) סופר־אדמין? שלח לפאנל
        if (me?.role === 'super_admin' || me?.is_super_admin) {
          window.location.replace('/super-admin');
          return;
        }

        // 3) אם יש family_id – ישירות לדשבורד
        const familyId =
          me?.family_id ||
          sessionStorage.getItem('preview_family_id') || // תמיכה ב-Preview ידנית
          null;

        if (familyId) {
          // אופציונלי: שמירת ה-family_id בקונטקסט/סטור – כאן רק ניווט
          window.location.replace('/dashboard');
          return;
        }

        // 4) אין משפחה → מסך הקמה/הצטרפות
        window.location.replace('/setup');
      } catch (e) {
        // לא לצאת ללופ; להציג הודעה ברורה ולתת לינק ידני ל-login
        console.error(e);
        setMsg('שגיאה בטעינה: no-user');
        setTimeout(() => {
          const from = encodeURIComponent(window.location.href);
          window.location.replace(`/login?from_url=${from}`);
        }, 500);
      }
    })();
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      {msg}
    </div>
  );
}