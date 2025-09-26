import React, { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Palette, BookOpen, Clock, MapPin } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { he } from 'date-fns/locale';
import ActivityIcon from '@/components/ActivityIcon';

const PARENT_COLORS = {
  'חגית': '#9333EA',
  'לירן': '#2563EB',
};

export default function CalendarDay({ 
  day, 
  isCurrentMonth, 
  events, 
  activities, 
  homework, 
  holidays, 
  responsibleParent, 
  children, 
  selectedChildren,
  isMobileView = false
}) {
  const isTodayDay = isToday(day);
  const responsibleParentName = responsibleParent || null;
  const parentColor = responsibleParentName ? PARENT_COLORS[responsibleParentName] : '#64748B';

  const { childSpecificEvents, childSpecificActivities, childSpecificHomework } = useMemo(() => {
    if (selectedChildren.length === 0) {
      return { childSpecificEvents: [], childSpecificActivities: [], childSpecificHomework: [] };
    }
    
    const childEvents = events.filter(item => item.child_ids && item.child_ids.some(id => selectedChildren.includes(id)));
    const childActivities = activities.filter(item => item.child_ids && item.child_ids.some(id => selectedChildren.includes(id)));
    const childHomework = homework.filter(item => item.child_id && selectedChildren.includes(item.child_id));

    return { 
      childSpecificEvents: childEvents, 
      childSpecificActivities: childActivities, 
      childSpecificHomework: childHomework 
    };
  }, [events, activities, homework, selectedChildren]);

  const allItems = [
    ...holidays.map(h => ({ ...h, type: 'holiday', priority: 1 })),
    ...childSpecificEvents.map(e => ({ ...e, type: 'event', priority: 2 })),
    ...childSpecificActivities.map(a => ({ ...a, type: 'activity', priority: 3 })),
    ...childSpecificHomework.map(h => ({ ...h, type: 'homework', priority: 4 }))
  ].sort((a, b) => a.priority - b.priority);

  if (isMobileView) {
    // Mobile layout - more spacious
    return (
      <div className="space-y-2">
        {allItems.length > 0 ? (
          allItems.map((item, index) => {
            if (item.type === 'holiday') {
              return (
                <div key={`holiday-${item.id}`} className="flex items-center p-2 text-sm bg-red-100 text-red-800 rounded-lg">
                  <Palette className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="font-medium">{item.title}</span>
                </div>
              );
            }
            
            if (item.type === 'event') {
              return (
                <div key={`event-${item.id}`} className="flex items-center p-2 text-sm bg-purple-100 text-purple-800 rounded-lg">
                  <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="font-medium">{item.title}</span>
                </div>
              );
            }
            
            if (item.type === 'activity') {
              return (
                <div key={`activity-${item.id}`} className="p-2 text-sm bg-green-100 text-green-800 rounded-lg">
                  <div className="flex items-center font-semibold mb-1">
                    <ActivityIcon activityName={item.name} className="w-4 h-4 mr-2 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {(item.start_time || item.end_time) && (
                    <div className="flex items-center text-green-700/80 text-xs mb-1">
                      <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{item.start_time}{item.end_time ? `-${item.end_time}` : ''}</span>
                    </div>
                  )}
                  {item.location && (
                    <div className="flex items-center text-green-700/80 text-xs">
                      <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
                      <span>{item.location}</span>
                    </div>
                  )}
                </div>
              );
            }
            
            if (item.type === 'homework') {
              return (
                <div key={`homework-${item.id}`} className="flex items-center p-2 text-sm bg-yellow-100 text-yellow-800 rounded-lg">
                  <BookOpen className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="font-medium">{item.title}</span>
                </div>
              );
            }
            
            return null;
          })
        ) : (
          <p className="text-gray-500 text-sm italic">אין אירועים</p>
        )}
      </div>
    );
  }

  // Desktop layout - compact
  return (
    <div
      className={`relative p-1 border border-gray-200 min-h-[120px] text-xs
        ${!isCurrentMonth ? 'bg-gray-100 text-gray-400' : 'bg-white'}
        ${isTodayDay ? 'border-2 border-blue-500 ring-1 ring-blue-300' : ''}
      `}
    >
      <div className={`absolute top-0.5 right-0.5 text-xs font-semibold ${isTodayDay ? 'text-blue-600' : ''}`}>
        {format(day, 'd', { locale: he })}
      </div>
      {responsibleParentName && (
        <Badge
          className="absolute top-0.5 left-0.5 text-xs px-1 py-0.5 text-white z-10 border-none"
          style={{ backgroundColor: parentColor, fontSize: '10px' }}
        >
          {responsibleParentName}
        </Badge>
      )}

      <div className="mt-5 space-y-0.5 max-h-[85px] overflow-y-auto">
        {allItems.map((item, index) => {
          if (item.type === 'holiday') {
            return (
              <div key={`holiday-${item.id}`} className="flex items-center p-0.5 text-xs bg-red-100 text-red-800 rounded">
                <Palette className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                <span className="truncate text-xs leading-tight">{item.title}</span>
              </div>
            );
          }
          
          if (item.type === 'event') {
            return (
              <div key={`event-${item.id}`} className="flex items-center p-0.5 text-xs bg-purple-100 text-purple-800 rounded">
                <Clock className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                <span className="truncate text-xs leading-tight">{item.title}</span>
              </div>
            );
          }
          
          if (item.type === 'activity') {
            return (
              <div key={`activity-${item.id}`} className="p-0.5 text-xs bg-green-100 text-green-800 rounded">
                <div className="flex items-center font-semibold mb-0.5">
                  <ActivityIcon activityName={item.name} className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                  <span className="truncate text-xs leading-tight">{item.name}</span>
                </div>
                {(item.start_time || item.end_time) && (
                  <div className="flex items-center text-green-700/80 text-xs">
                    <Clock className="w-2 h-2 mr-1 flex-shrink-0" />
                    <span className="text-xs">{item.start_time}{item.end_time ? `-${item.end_time}` : ''}</span>
                  </div>
                )}
                {item.location && (
                  <div className="flex items-center text-green-700/80 text-xs">
                    <MapPin className="w-2 h-2 mr-1 flex-shrink-0" />
                    <span className="truncate text-xs">{item.location}</span>
                  </div>
                )}
              </div>
            );
          }
          
          if (item.type === 'homework') {
            return (
              <div key={`homework-${item.id}`} className="flex items-center p-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">
                <BookOpen className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                <span className="truncate text-xs leading-tight">{item.title}</span>
              </div>
            );
          }
          
          return null;
        })}
      </div>
    </div>
  );
}