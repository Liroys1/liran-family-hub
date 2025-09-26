import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Loader2, ChevronRight, ChevronLeft, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, getDay, isSameMonth, isToday } from 'date-fns';
import { he } from 'date-fns/locale';

// Import new hooks
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useChildrenWithMembers } from '@/components/hooks/useChildrenWithMembers';
import { useEvents } from '@/components/hooks/useEvents';
import { useActivities } from '@/components/hooks/useActivities';
import { useCustodyMap } from '@/components/hooks/useCustodyMap';

import CalendarDay from '@/components/shared/CalendarDay';

export default function CalendarContent() {
  const { user, family } = useFamilyContext();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [isMobileView, setIsMobileView] = useState(false);

  // Calculate date range for current month (minimum load)
  const dateRange = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    return {
      from: format(monthStart, 'yyyy-MM-dd'),
      to: format(monthEnd, 'yyyy-MM-dd')
    };
  }, [currentDate]);

  // EFFICIENT DATA LOADING: Only current month + minimal fields
  const { data: children = [], isLoading: isLoadingChildren } = useChildrenWithMembers(family?.id, { activeOnly: true });
  const { data: events = [], isLoading: isLoadingEvents } = useEvents(family?.id, dateRange, { childIds: selectedChildren });
  const { data: activities = [], isLoading: isLoadingActivities } = useActivities(family?.id);
  const { data: custodyMap = {} } = useCustodyMap(family?.id, dateRange); // Memoized custody calculation

  // Check if mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Auto-select children based on user role
  useEffect(() => {
    if (children.length > 0 && selectedChildren.length === 0 && user) {
      if (user.family_role === 'parent' || user.family_role === 'grandparent') {
        setSelectedChildren(children.map(c => c.id));
      } else if (user.family_role === 'child') {
        // Find child record that matches current user's member_id
        const myChildRecord = children.find(c => c.member_id === user.member_id);
        if (myChildRecord) {
          setSelectedChildren([myChildRecord.id]);
        }
      }
    }
  }, [children, user, selectedChildren.length]);

  const handleChildSelection = (childId) => {
    setSelectedChildren(prev => {
      // If child user, don't allow deselecting themselves if it's the only one
      if (user?.family_role === 'child') {
        const myChildRecord = children.find(c => c.member_id === user.member_id);
        if (myChildRecord?.id === childId && prev.includes(childId) && prev.length === 1) {
          return prev;
        }
      }

      if (prev.includes(childId)) {
        return prev.filter(id => id !== childId);
      } else {
        return [...prev, childId];
      }
    });
  };

  // Calendar navigation
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = [];
    
    // Add all days in month
    for (let d = new Date(monthStart); d <= monthEnd; d.setDate(d.getDate() + 1)) {
      days.push(new Date(d));
    }
    return days;
  }, [currentDate]);

  const getItemsForDay = (date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][getDay(date)];
    
    return {
      events: events.filter(e => e.date === dateString),
      activities: activities.filter(a => a.day_of_week === dayName),
      holidays: events.filter(e => e.date === dateString && (e.type === 'holiday' || e.type === 'vacation')),
      homework: [] // Will be loaded separately when needed
    };
  };

  if (isLoadingChildren || isLoadingEvents || isLoadingActivities) {
    return (
      <div className="p-8 flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="mr-2">טוען נתונים...</span>
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 lg:p-6" dir="rtl">
      <Card className="mb-4 sm:mb-6">
        <CardHeader className="pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold">
              {format(currentDate, 'MMMM yyyy', { locale: he })}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size={isMobileView ? "sm" : "icon"} 
                onClick={goToPreviousMonth}
                className="w-auto sm:w-10 h-8 sm:h-10"
              >
                <ChevronRight className="h-3 w-3 sm:h-4 sm:w-4" />
                {isMobileView && <span className="mr-1">קודם</span>}
              </Button>
              <Button 
                variant="outline" 
                size={isMobileView ? "sm" : "icon"} 
                onClick={goToNextMonth}
                className="w-auto sm:w-10 h-8 sm:h-10"
              >
                {isMobileView && <span className="ml-1">הבא</span>}
                <ChevronLeft className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {children.length > 0 && (
            <div className="mb-4 p-3 border rounded-md bg-gray-50">
              <span className="font-semibold text-sm block mb-2 sm:inline sm:mb-0 sm:ml-2">הצג עבור:</span>
              <div className="flex flex-wrap gap-2 sm:gap-4">
                {children.map(child => (
                  <div key={child.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`child-${child.id}`}
                      checked={selectedChildren.includes(child.id)}
                      onCheckedChange={() => handleChildSelection(child.id)}
                    />
                    <Label htmlFor={`child-${child.id}`} className="text-xs sm:text-sm whitespace-nowrap">
                      {child.hebrew_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mobile: List View */}
          {isMobileView ? (
            <div className="space-y-2">
              {calendarDays.map((day, index) => {
                const dayItems = getItemsForDay(day);
                const responsibleParent = custodyMap[format(day, 'yyyy-MM-dd')];
                const todayCheck = isToday(day);

                return (
                  <Card key={index} className={`p-3 ${todayCheck ? 'border-blue-500 bg-blue-50' : ''}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span className={`font-semibold ${todayCheck ? 'text-blue-600' : ''}`}>
                          {format(day, 'EEEE d MMMM', { locale: he })}
                        </span>
                      </div>
                      {responsibleParent && (
                        <div 
                          className="px-2 py-1 rounded-full text-xs text-white font-semibold"
                          style={{ backgroundColor: responsibleParent === 'חגית' ? '#9333EA' : '#2563EB' }}
                        >
                          {responsibleParent}
                        </div>
                      )}
                    </div>
                    <CalendarDay
                      day={day}
                      isCurrentMonth={true}
                      events={dayItems.events.filter(e => e.type !== 'holiday' && e.type !== 'vacation')}
                      activities={dayItems.activities}
                      homework={dayItems.homework}
                      holidays={dayItems.holidays}
                      responsibleParent={responsibleParent}
                      children={children}
                      selectedChildren={selectedChildren}
                      isMobileView={true}
                    />
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Desktop: Grid View */
            <>
              <div className="grid grid-cols-7 text-center text-sm font-medium text-gray-500 mb-2 border-b pb-2">
                <div>א׳</div><div>ב׳</div><div>ג׳</div><div>ד׳</div><div>ה׳</div><div>ו׳</div><div>ש׳</div>
              </div>
              <div className="grid grid-cols-7 gap-px bg-gray-200">
                {calendarDays.map((day, index) => {
                  const dayItems = getItemsForDay(day);
                  const responsibleParent = custodyMap[format(day, 'yyyy-MM-dd')];

                  return (
                    <CalendarDay
                      key={index}
                      day={day}
                      isCurrentMonth={isSameMonth(day, currentDate)}
                      events={dayItems.events.filter(e => e.type !== 'holiday' && e.type !== 'vacation')}
                      activities={dayItems.activities}
                      homework={dayItems.homework}
                      holidays={dayItems.holidays}
                      responsibleParent={responsibleParent}
                      children={children}
                      selectedChildren={selectedChildren}
                      isMobileView={false}
                    />
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}