
import React, { useMemo } from 'react';
import { PERIODS } from '@/components/constants'; // Import PERIODS

const ChildFinishTimeCalculator = ({ 
  child, 
  schedules, 
  activities, 
  overrides, 
  date = new Date() 
}) => {
  const finishTime = useMemo(() => {
    if (!child) return "לא הצליחה להביא נתונים";

    const today = new Date(date);
    const dayOfWeek = today.getDay();
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayName = dayNames[dayOfWeek];
    const todayString = today.toISOString().split('T')[0];

    try {
      // Special logic for Shira (unchanged)
      if (child.hebrew_name === 'שירה') {
        const override = overrides?.find(o => o.child_id === child.id && o.date === todayString);
        if (override) {
          if (override.has_after_school) {
            return override.end_time || '16:45';
          } else {
            const todaySchedules = schedules?.filter(s => s.child_id === child.id && s.day_of_week === todayName) || [];
            if (todaySchedules.length > 0) {
              const latestPeriodNumber = Math.max(...todaySchedules.map(s => s.period_number));
              const latestPeriod = PERIODS.find(p => p.number === latestPeriodNumber);
              return latestPeriod ? latestPeriod.end_time : "שגיאה";
            }
          }
        }
        
        if (todayName === 'friday') {
            const todaySchedules = schedules?.filter(s => s.child_id === child.id && s.day_of_week === todayName) || [];
            if (todaySchedules.length > 0) {
              const latestPeriodNumber = Math.max(...todaySchedules.map(s => s.period_number));
              const latestPeriod = PERIODS.find(p => p.number === latestPeriodNumber);
              return latestPeriod ? latestPeriod.end_time : "12:25";
            }
            return "12:25";
        } else {
          return "16:45";
        }
      }

      // **FIXED GENERIC LOGIC FOR ALL OTHER CHILDREN (INCLUDING YAEL)**
      const todaySchedules = schedules?.filter(s => s.child_id === child.id && s.day_of_week === todayName) || [];
      
      if (todaySchedules.length > 0) {
        // Find the highest period number for today
        const latestPeriodNumber = todaySchedules.reduce((maxPeriod, current) => {
            return (current.period_number > maxPeriod) ? current.period_number : maxPeriod;
        }, 0);

        // If we found a valid period
        if (latestPeriodNumber > 0) {
            // Find the corresponding period object from the official PERIODS constant
            const latestPeriod = PERIODS.find(p => p.number === latestPeriodNumber);
            if (latestPeriod) {
                // Return the official end time, ignoring any data errors in the schedule record
                return latestPeriod.end_time;
            }
        }
      }

      return "לא הצליחה להביא נתונים";
      
    } catch (error) {
      console.error(`Error calculating finish time for ${child.hebrew_name}:`, error);
      return "לא הצליחה להביא נתונים";
    }
  }, [child, schedules, overrides, date]); // 'activities' removed from dependency array

  return finishTime;
};

export default ChildFinishTimeCalculator;
