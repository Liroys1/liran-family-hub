import { useQuery } from '@tanstack/react-query';
import { CustodyTemplate, CustodyOverride } from '@/api/entities';

/** מחזיר map של { '2025-01-01': 'responsible_parent' } לטווח נתון */
export function useCustodyMap(familyId, range) {
  const enabled = !!familyId && !!range?.from && !!range?.to;
  
  return useQuery({
    queryKey: ['custodyMap', familyId, range],
    queryFn: async () => {
      try {
        // נטען את התבנית והחריגים
        const templates = await CustodyTemplate.filter({ 
          family_id: familyId, 
          is_active: true 
        });
        const template = templates.length > 0 ? templates[0] : null;
        
        let filters = { family_id: familyId };
        if (range.from) filters.date_gte = range.from;
        if (range.to) filters.date_lte = range.to;
        
        const overrides = await CustodyOverride.filter(filters);
        
        // יצירת מפה של תאריך -> הורה אחראי
        const custodyMap = {};
        
        // אם יש תבנית, נמלא מהתבנית
        if (template && template.start_date && template.week_a && template.week_b) {
          const startDate = new Date(template.start_date);
          const fromDate = range.from ? new Date(range.from) : new Date();
          const toDate = range.to ? new Date(range.to) : new Date();
          
          for (let d = new Date(fromDate); d <= toDate; d.setDate(d.getDate() + 1)) {
            const dayOfWeek = d.getDay();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayKey = dayNames[dayOfWeek];
            
            // חישוב איזה שבוע (A או B)
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
        
        // דריסה עם חריגים
        overrides.forEach(override => {
          custodyMap[override.date] = override.responsible_parent;
        });
        
        return custodyMap;
      } catch (error) {
        console.warn('Failed to load custody data:', error);
        return {};
      }
    },
    enabled,
    staleTime: 60 * 1000,
  });
}