import { useQuery } from '@tanstack/react-query';
import { CustodyTemplate, CustodyOverride } from '@/api/entities';
import { queryKeys } from '@/components/constants/queryKeys';
import { useMemo } from 'react';

export const useCustodyTemplate = (familyId) => {
  return useQuery({
    queryKey: queryKeys.custodyTemplate(familyId),
    queryFn: async () => {
      if (!familyId) return null;
      const templates = await CustodyTemplate.filter({ 
        family_id: familyId, 
        is_active: true 
      });
      return templates.length > 0 ? templates[0] : null;
    },
    enabled: !!familyId,
    staleTime: 10 * 60 * 1000, // Custody template rarely changes - 10 minutes
  });
};

export const useCustodyOverrides = (familyId, range = {}) => {
  return useQuery({
    queryKey: queryKeys.custodyOverrides(familyId, range),
    queryFn: async () => {
      if (!familyId) return [];
      
      let filters = { family_id: familyId };
      
      // Add date range filtering
      if (range.from) {
        filters.date_gte = range.from;
      }
      if (range.to) {
        filters.date_lte = range.to;
      }
      
      return await CustodyOverride.filter(filters, 'date');
    },
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000, // Overrides can change - 5 minutes
    select: (data) => data || [],
  });
};

// Helper hook that combines template + overrides into a day->responsible map
export const useCustodyMap = (familyId, range = {}) => {
  const templateQuery = useCustodyTemplate(familyId);
  const overridesQuery = useCustodyOverrides(familyId, range);
  
  return useMemo(() => {
    const template = templateQuery.data;
    const overrides = overridesQuery.data || [];
    
    if (!template) return {};
    
    // Create map of date -> responsible parent
    const custodyMap = {};
    
    // First, populate from template
    if (template.start_date && template.week_a && template.week_b) {
      const startDate = new Date(template.start_date);
      const fromDate = range.from ? new Date(range.from) : new Date();
      const toDate = range.to ? new Date(range.to) : new Date();
      
      for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = d.getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayKey = dayNames[dayOfWeek];
        
        // Calculate which week (A or B)
        const startOfStartWeek = new Date(startDate);
        startOfStartWeek.setDate(startDate.getDate() - startDate.getDay());
        startOfStartWeek.setHours(0, 0, 0, 0);
        
        const startOfCurrentWeek = new Date(d);
        startOfCurrentWeek.setDate(d.getDate() - d.getDay());
        startOfCurrentWeek.setHours(0, 0, 0, 0);
        
        const weeksDiff = Math.floor((startOfCurrentWeek - startOfStartWeek) / (7 * 24 * 60 * 60 * 1000));
        const isWeekA = weeksDiff % 2 === 0;
        
        const week = isWeekA ? template.week_a : template.week_b;
        if (week && week[dayKey]) {
          custodyMap[d.toISOString().split('T')[0]] = week[dayKey];
        }
      }
    }
    
    // Override with specific dates
    overrides.forEach(override => {
      custodyMap[override.date] = override.responsible_parent;
    });
    
    return custodyMap;
  }, [templateQuery.data, overridesQuery.data, range.from, range.to]);
};