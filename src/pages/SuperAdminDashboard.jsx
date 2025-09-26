// pages/SuperAdminDashboard.jsx
import { useState } from 'react';

const DEMO_FAMILIES = [
  { id: 'fam_shaked', name: 'משפחת שקד' },
  { id: 'fam_cohen', name: 'משפחת כהן' },
  { id: 'fam_levi', name: 'משפחת לוי' },
];

export default function SuperAdminDashboard() {
  const [families] = useState(DEMO_FAMILIES);

  function enterFamily(fid) {
    sessionStorage.setItem('preview_family_id', fid);
    // אחרי ששמרנו, ננווט לדשבורד. BootGate יתפוס את זה ברענון הבא אם יהיה.
    window.location.replace('/dashboard');
  }

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4" dir="rtl">
      <h1 className="text-xl font-semibold">לוח סופר־אדמין</h1>
      
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="font-semibold mb-3">כניסה ידנית למשפחה קיימת (לבדיקות)</div>
        <div className="flex flex-wrap gap-2">
          {families.map(f => (
            <button 
              key={f.id}
              onClick={() => enterFamily(f.id)} 
              className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              {f.name}
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow p-4">
        <div className="font-semibold mb-2">אפשרויות</div>
        <div className="flex gap-2">
          <button onClick={() => window.location.replace('/setup')} className="px-3 py-2 rounded-xl border hover:bg-gray-50">
            צור משפחה חדשה
          </button>
          <button onClick={() => window.location.replace('/join')} className="px-3 py-2 rounded-xl border hover:bg-gray-50">
            הצטרף לפי שם/קוד
          </button>
        </div>
      </div>
    </div>
  );
}