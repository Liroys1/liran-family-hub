import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ClassContact } from '@/api/entities';

export const useClassContacts = (familyId) => {
  return useQuery({
    queryKey: ['classContacts', familyId],
    queryFn: async () => {
      if (!familyId) return [];
      return await ClassContact.filter({ family_id: familyId });
    },
    enabled: !!familyId,
    staleTime: 10 * 60 * 1000, // Contacts change rarely
    select: (data) => data || [],
  });
};

export const useMutateContact = (familyId) => {
    const queryClient = useQueryClient();

    const onSettled = () => {
        queryClient.invalidateQueries({ queryKey: ['classContacts', familyId] });
    };

    const createMutation = useMutation({
        mutationFn: (data) => ClassContact.create({ ...data, family_id: familyId }),
        onSettled,
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, ...data }) => ClassContact.update(id, data),
        onSettled,
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => ClassContact.delete(id),
        onSettled,
    });

    return { createMutation, updateMutation, deleteMutation };
};