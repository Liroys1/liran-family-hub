import { useQuery } from '@tanstack/react-query';
import { FamilySummary } from '@/api/entities';

// This hook simulates a call to a server-side view/projection.
// In a real Base44 setup with backend functions, this would call a function.
// For now, it will filter a "FamilySummary" entity.
export const useFamilySummary = (familyId, range = 'next7d', limits = {}) => {
  const { nextEvents = 5, todayTasks = 10 } = limits;
  
  return useQuery({
    queryKey: ['familySummary', familyId, range, limits],
    queryFn: async () => {
      if (!familyId) return null;
      
      const summaries = await FamilySummary.filter({
        family_id: familyId,
        range: range,
        // The 'limits' part is illustrative; filtering would happen server-side
        // for a true projection. Here we assume the entity returns what we need.
      }, '-generated_at', 1);
      
      return summaries.length > 0 ? summaries[0] : null;
    },
    enabled: !!familyId,
    staleTime: 60 * 1000, // 1 minute, as summary data is volatile
    retry: 1,
  });
};