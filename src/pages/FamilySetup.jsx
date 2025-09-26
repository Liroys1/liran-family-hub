import React, { useState } from 'react';
import BackButton from '../components/BackButton';
import { navigateTo } from '../components/router/previewRouter';

export default function FamilySetup() {
  const [familyName, setFamilyName] = useState('');
  const [loading, setLoading] = useState(false);

  async function createFamily() {
    if (!familyName.trim()) return;
    
    setLoading(true);
    try {
      // For now, in preview we save to localStorage
      const newFamilyId = 'fam_' + Date.now();
      localStorage.setItem('debug.family_id', newFamilyId);
      localStorage.setItem('debug.family_role', 'parent');
      
      navigateTo('/dashboard');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid place-items-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow p-6 space-y-4">
        <div className="flex justify-start">
            <BackButton fallback="/boot" />
        </div>
        
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">הקמת משפחה חדשה</h1>
          <p className="text-gray-600">צור מרכז ניהול לכל המשפחה</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">שם המשפחה</label>
            <input
              type="text"
              className="w-full border rounded-xl px-3 py-2"
              placeholder="לדוגמה: משפחת שקד"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
            />
          </div>

          <button
            onClick={createFamily}
            disabled={loading || !familyName.trim()}
            className="w-full bg-blue-600 text-white rounded-xl py-3 disabled:opacity-50 hover:bg-blue-700"
          >
            {loading ? 'יוצר משפחה...' : 'יצירת משפחה'}
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t text-center">
            <button 
              className="w-full text-blue-600 hover:underline"
              onClick={() => navigateTo('/join')}
             >
                יש לי קוד הצטרפות
            </button>
        </div>
      </div>
    </div>
  );
}