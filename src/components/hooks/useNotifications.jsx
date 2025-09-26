import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Notification } from '@/api/entities';
import { queryKeys } from '@/components/constants/queryKeys';

export function useNotifications(familyId, memberId) {
  return useQuery({
    queryKey: queryKeys.notifications(familyId, memberId),
    queryFn: () => Notification.filter(
      { family_id: familyId, member_id: memberId },
      '-created_date',
      50
    ),
    enabled: !!familyId && !!memberId,
    staleTime: 30 * 1000, // Data is fresh for 30 seconds
    refetchInterval: 60 * 1000, // Poll for new notifications every minute
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => Notification.update(id, { status: 'read', read_at: new Date().toISOString() }),
    onSuccess: (data, variables) => {
      // Invalidate all notification queries after marking one as read
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications() });
    },
  });
}