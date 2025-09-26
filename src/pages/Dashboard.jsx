import { useEffect, useState } from 'react';
import { useCurrentUser } from '../components/hooks/useCurrentUser';

export default function Dashboard() {
  const { data: user, isLoading } = useCurrentUser();
  const [state, setState] = useState({ loading: true, error: null, fid: null });

  useEffect(() => {
    if (isLoading) return;
    
    if (!user) {
      setState({ loading: false, error: 'no-user' });
      return;
    }

    // בדוק family_id אמיתי או Preview
    const effectiveFamilyId = user.family_id || sessionStorage.getItem('preview_family_id');
    
    if (!effectiveFamilyId) { 
      setState({ loading: false, error: 'no-family' }); 
      return; 
    }
    
    // כאן לטעון נתונים לפי effectiveFamilyId
    setState({ loading: false, fid: effectiveFamilyId });
  }, [user, isLoading]);

  if (isLoading || state.loading) return <div className="p-4">טוען דשבורד…</div>;
  if (state.error) return <div className="p-4">שגיאה בטעינה: {state.error}</div>;

  // render הווידג'טים לפי state.fid
  return (
    <div className="p-4" dir="rtl">
      <h1 className="text-3xl font-bold mb-6">דשבורד משפחתי</h1>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <p className="text-xl">ברוך הבא {user?.full_name || user?.hebrew_name || user?.email}!</p>
        <p className="text-gray-600 mt-2">משפחה: {state.fid}</p>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-800 font-medium">הדשבורד שלך מוכן! 🎉</p>
          <p className="text-blue-600 text-sm mt-1">כאן יופיעו כל הווידג'טים של משפחת שקד</p>
        </div>
      </div>
    </div>
  );
}