import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Member } from '@/api/entities';
import { queryKeys } from '@/components/constants/queryKeys';

export const useMembers = (familyId, { activeOnly = true } = {}) => {
  return useQuery({
    queryKey: queryKeys.members(familyId, { activeOnly }),
    queryFn: () => {
      const filters = { family_id: familyId };
      if (activeOnly) {
        filters.is_active = true;
      }
      return Member.filter(filters, 'hebrew_name');
    },
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateMember = (familyId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (newMemberData) => Member.create(newMemberData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members(familyId) });
        }
    });
};

export const useUpdateMember = (familyId) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...updateData }) => Member.update(id, updateData),
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.members(familyId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.member(variables.id) });
            queryClient.invalidateQueries({ queryKey: queryKeys.currentUser() });
             queryClient.invalidateQueries({ queryKey: queryKeys.childrenWithMembers(familyId) });
        }
    });
};