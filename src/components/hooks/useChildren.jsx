import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Child } from '@/api/entities';

export const useChildren = (familyId, options = {}) => {
  const { activeOnly = false } = options;
  
  return useQuery({
    queryKey: ['children', familyId, { activeOnly }],
    queryFn: async () => {
      if (!familyId) return [];
      let filters = { family_id: familyId };
      if (activeOnly) {
        filters.is_active = true;
      }
      return await Child.filter(filters);
    },
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000, // Children data is relatively stable
    select: (data) => data || [],
  });
};

export const useChild = (childId) => {
  return useQuery({
    queryKey: ['child', childId],
    queryFn: async () => {
      if (!childId) return null;
      const children = await Child.filter({ id: childId });
      return children.length > 0 ? children[0] : null;
    },
    enabled: !!childId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateChild = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (childData) => Child.create(childData),
    onSuccess: (newChild) => {
      // Invalidate and refetch children list for this family
      queryClient.invalidateQueries({ 
        queryKey: ['children', newChild.family_id] 
      });
    },
  });
};

export const useUpdateChild = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => Child.update(id, data),
    onSuccess: (updatedChild) => {
      // Update the specific child in cache
      queryClient.setQueryData(['child', updatedChild.id], updatedChild);
      
      // Invalidate children list for this family
      queryClient.invalidateQueries({ 
        queryKey: ['children', updatedChild.family_id] 
      });
    },
  });
};

export const useDeleteChild = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, familyId }) => Child.delete(id),
    onSuccess: (_, { familyId }) => {
      // Invalidate children list for this family
      queryClient.invalidateQueries({ 
        queryKey: ['children', familyId] 
      });
    },
  });
};