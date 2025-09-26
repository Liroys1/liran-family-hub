import { useQuery } from '@tanstack/react-query';
import { Child, Member } from '@/api/entities';
import { queryKeys } from '@/components/constants/queryKeys';

export const useChildrenWithMembers = (familyId, options = {}) => {
  const { activeOnly = true } = options;
  
  return useQuery({
    queryKey: queryKeys.childrenWithMembers(familyId, { activeOnly }),
    queryFn: async () => {
      if (!familyId) return [];
      
      // Get all children for family
      let childFilters = { family_id: familyId };
      if (activeOnly) {
        childFilters.is_active = true;
      }
      
      const children = await Child.filter(childFilters);
      
      if (children.length === 0) return [];
      
      // Get all members for these children
      const memberIds = children.map(child => child.member_id).filter(Boolean);
      if (memberIds.length === 0) return [];
      
      const members = await Member.filter({ 
        id: { $in: memberIds }, 
        family_id: familyId 
      });
      
      // Combine children with their member data
      return children.map(child => {
        const member = members.find(m => m.id === child.member_id);
        return {
          ...child,
          // Member data for display (name, image, color)
          hebrew_name: member?.hebrew_name || 'ילד',
          display_name: member?.display_name || member?.hebrew_name || 'ילד',
          image_url: member?.image_url,
          color: member?.color || '#64748B',
          contact_email: member?.contact_email,
          contact_phone: member?.contact_phone
        };
      });
    },
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000, // 5 minutes - children+members are relatively stable
    select: (data) => data || [],
  });
};