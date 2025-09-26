import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useEvents } from './useEvents';
import { Activity } from '@/api/entities';
import { useCustodyMap } from './useCustody';

/**
 * @typedef {Object} CalendarItem
 * @property {string} id
 * @property {'event'|'activity'|'custody'} kind
 * @property {string} date
 * @property {string} [end_date]
 * @property {string} [start_time]
 * @property {string} [end_time]
 * @property {string} title
 * @property {string} [color]
 * @property {string[]} [child_ids]
 * @property {string[]} [member_ids]
 * @property {string} [location]
 * @property {Object} [meta]
 */

export const useCalendarWindow = (familyId, range, filter = {}) => {
  // Get events for the range
  const eventsQuery = useEvents(familyId, range, filter);
  
  // Get activities (recurring by day of week)
  const activitiesQuery = useQuery({
    queryKey: ['activities-calendar', familyId, range, filter],
    queryFn: async () => {
      if (!familyId) return [];
      let filters = { family_id: familyId, is_active: true };
      
      // Apply child filter if specified
      if (filter.childIds && filter.childIds.length > 0) {
        // Note: This would need server-side array filtering support
        // For now, we'll filter client-side
      }
      
      return await Activity.filter(filters);
    },
    enabled: !!familyId,
    staleTime: 10 * 60 * 1000, // Activities don't change often
  });

  // Get custody information for the range
  const custodyMap = useCustodyMap(familyId, range);

  // Merge all sources into unified calendar items
  const calendarData = useMemo(() => {
    if (!range?.from || !range?.to) return { data: [], isLoading: false };

    /** @type {CalendarItem[]} */
    const items = [];

    // 1) Add events
    (eventsQuery.data || []).forEach((event) => {
      items.push({
        id: event.id,
        kind: 'event',
        title: event.title,
        date: event.date,
        end_date: event.end_date,
        start_time: event.start_time,
        end_time: event.end_time,
        child_ids: event.child_ids,
        member_ids: event.member_ids,
        location: event.location,
        color: event.color,
        meta: { 
          type: event.type, 
          description: event.description,
          all_day: event.all_day
        }
      });
    });

    // 2) Add activities - expand by day of week within range
    (activitiesQuery.data || []).forEach((activity) => {
      const daysInRange = expandDaysInRangeByDow(range.from, range.to, activity.day_of_week);
      daysInRange.forEach((date) => {
        items.push({
          id: `${activity.id}:${date}`,
          kind: 'activity',
          title: activity.name,
          date: date,
          start_time: activity.start_time,
          end_time: activity.end_time,
          child_ids: activity.child_ids,
          location: activity.location,
          color: activity.color || '#10B981', // Default green for activities
          meta: { 
            type: activity.type,
            instructor: activity.instructor,
            recurring: true
          }
        });
      });
    });

    // 3) Add custody information
    Object.entries(custodyMap).forEach(([date, responsibleParent]) => {
      if (isDateInRange(date, range.from, range.to)) {
        items.push({
          id: `custody:${date}`,
          kind: 'custody',
          title: `אחראי: ${responsibleParent}`,
          date: date,
          color: getParentColor(responsibleParent),
          meta: { responsible_parent: responsibleParent }
        });
      }
    });

    // Sort by date and time
    return items.sort(byDateTime);
  }, [eventsQuery.data, activitiesQuery.data, custodyMap, range.from, range.to]);

  const isLoading = eventsQuery.isLoading || activitiesQuery.isLoading;

  return { 
    data: calendarData, 
    isLoading,
    events: eventsQuery.data || [],
    activities: activitiesQuery.data || [],
    custodyMap
  };
};

// Helper functions
const byDateTime = (a, b) => {
  const getDateTime = (item) => `${item.date} ${item.start_time || '00:00'}`;
  return getDateTime(a).localeCompare(getDateTime(b));
};

const expandDaysInRangeByDow = (fromDate, toDate, dayOfWeek) => {
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const targetDow = dayNames.indexOf(dayOfWeek);
  
  if (targetDow === -1) return [];
  
  const dates = [];
  const start = new Date(fromDate);
  const end = new Date(toDate);
  
  // Find the first occurrence of the target day
  let current = new Date(start);
  while (current.getDay() !== targetDow && current <= end) {
    current.setDate(current.getDate() + 1);
  }
  
  // Add all occurrences within range
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 7); // Next week
  }
  
  return dates;
};

const isDateInRange = (date, from, to) => {
  return date >= from && date <= to;
};

const getParentColor = (parentName) => {
  const colors = {
    'חגית': '#9333EA',
    'לירן': '#2563EB',
  };
  return colors[parentName] || '#64748B';
};