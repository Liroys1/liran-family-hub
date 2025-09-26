/**
 * useDashboardConfig.js - טעינת תצורת דשבורד דינמית לפי תפקיד
 * מאפשר התאמה אישית של הווידג'טים בדשבורד עבור כל תפקיד במשפחה
 */
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/components/lib/base44';

export function useDashboardConfig(familyId, role) {
  return useQuery({
    queryKey: ['dashboardConfig', familyId, role],
    queryFn: async () => {
      const rows = await entities.list('DashboardConfig', { 
        family_id: familyId, 
        role, 
        limit: 1 
      });
      return rows?.[0] ?? null;
    },
    enabled: !!familyId && !!role,
    staleTime: 5 * 60_000, // Cache for 5 minutes
  });
}