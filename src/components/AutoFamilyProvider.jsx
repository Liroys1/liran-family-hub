/**
 * AutoFamilyProvider - קומפוננטת עזר חכמה.
 * מטרתה לעטוף דפים בודדים (כמו ב-Preview של Base44) שצריכים את FamilyContext
 * אבל אינם נטענים דרך ה-Layout הראשי.
 * היא טוענת את המשתמש והמשפחה באופן אוטומטי ומספקת אותם דרך FamilyContext.Provider.
 */
import React from 'react';
import { FamilyProvider } from '@/components/context/FamilyContext';
import { useQuery } from '@tanstack/react-query';
import { User, Family } from '@/api/entities';
import { useCurrentMember } from './hooks/useCurrentMember';

export function AutoFamilyProvider({ children }) {
  // Call ALL hooks unconditionally at the top
  const userQ = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => User.me(),
    staleTime: 5 * 60 * 1000
  });

  // Extract familyId safely for the second query
  const familyId = userQ.data?.family_id;

  // Call second query unconditionally, but disable it if no familyId
  const familyQ = useQuery({
    queryKey: ['family', familyId],
    queryFn: async () => {
      if (!familyId) return null;
      const families = await Family.filter({ id: familyId });
      return families.length > 0 ? families[0] : null;
    },
    enabled: !!familyId, // This prevents the query from running if familyId is null/undefined
    staleTime: 5 * 60 * 1000
  });

  const { data: member } = useCurrentMember(userQ.data?.id, familyId);

  // Now we can do conditional rendering AFTER all hooks have been called
  if (userQ.isLoading) return <div className="p-6">טוען…</div>;
  if (!userQ.data) return <div className="p-6 text-red-600">לא מזוהה. התחבר/י מחדש.</div>;

  return (
    <FamilyProvider value={{ user: userQ.data, family: familyQ.data, member }}>
      {children}
    </FamilyProvider>
  );
}