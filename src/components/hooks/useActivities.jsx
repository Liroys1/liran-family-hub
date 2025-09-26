import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity } from '@/api/entities';

export const useActivities = (familyId) => {
  return useQuery({
    queryKey: ['activities', familyId],
    queryFn: async () => {
      if (!familyId) return [];
      return await Activity.filter({ family_id: familyId });
    },
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
    select: (data) => data || [],
  });
};

export const useMutateActivity = (familyId) => {
    const queryClient = useQueryClient();

    const onSettled = () => {
        queryClient.invalidateQueries({ queryKey: ['activities', familyId] });
    };

    const createMutation = useMutation({
        mutationFn: (data) => Activity.create({ ...data, family_id: familyId }),
        onSettled,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }) => Activity.update(id, data),
        onSettled,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => Activity.delete(id),
        onSettled,
    });

    return { createMutation, updateMutation, deleteMutation };
};
