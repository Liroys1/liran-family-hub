import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from './hooks/useCurrentUser';
import { replace } from './lib/router';

export default function BootGate() {
  const { data: user, isLoading, error } = useCurrentUser();

  useEffect(() => {
    if (isLoading) return;

    // אם 401 – האינטרספטור כבר ישלח ל-/login
    if (!user) return;

    // תמיכת PREVIEW: לאפשר לסופר־אדמין "לצלול" למשפחה דרך sessionStorage
    const previewFamilyId = sessionStorage.getItem('preview_family_id') || undefined;

    const isSuper = (user.roles || []).includes('super_admin') || user.family_role === 'super_admin';

    const effectiveFamilyId = user.family_id || previewFamilyId || null;

    if (isSuper && !effectiveFamilyId) {
      replace('/super-admin');
      return;
    }

    if (!effectiveFamilyId) {
      replace('/setup');   // מסך יצירה/הצטרפות למשפחה
      return;
    }

    replace('/dashboard');
  }, [isLoading, user]);

  // מצב ביניים קטן
  return <div style={{ padding: 16 }}>טוען…</div>;
}