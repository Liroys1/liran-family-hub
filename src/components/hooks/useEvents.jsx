import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Event } from '@/api/entities';
import { queryKeys } from '@/components/constants/queryKeys';

export const useEvents = (familyId, range, filters = {}) => {
  const { childIds, type } = filters;
  
  return useQuery({
    queryKey: queryKeys.events(familyId, range, filters),
    queryFn: async () => {
      if (!familyId || !range?.from || !range?.to) return [];
      
      let queryFilters = { 
        family_id: familyId,
        date_gte: range.from,
        date_lte: range.to
      };
      
      if (type) {
        queryFilters.type = type;
      }
      
      // Note: child_ids filtering might need to be done client-side
      // depending on Base44's array filtering capabilities
      
      return await Event.filter(queryFilters, 'date', 200);
    },
    enabled: !!familyId && !!range?.from && !!range?.to,
    staleTime: 2 * 60 * 1000, // Events for a specific range - 2 minutes
    select: (data) => {
      let filteredData = data || [];
      
      // Client-side filtering for child_ids if needed
      if (childIds && childIds.length > 0) {
        filteredData = filteredData.filter(event => 
          !event.child_ids || event.child_ids.some(id => childIds.includes(id))
        );
      }
      
      return filteredData.sort((a, b) => a.date.localeCompare(b.date));
    },
  });
};

export const useCreateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (eventData) => Event.create(eventData),
    onSuccess: (newEvent) => {
      // Invalidate events for this family (all date ranges)
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.events(newEvent.family_id) 
      });
    },
  });
};

export const useUpdateEvent = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => Event.update(id, data),
    onSuccess: (updatedEvent) => {
      // Invalidate events for this family
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.events(updatedEvent.family_id) 
      });
    },
  });
};