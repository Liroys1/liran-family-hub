import React, { useMemo } from 'react';
import { Loader2, Star, Calendar, ClipboardCheck } from 'lucide-react';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useTasks } from '@/components/hooks/useTasks';
import { useCustodyMap } from '@/components/hooks/useCustodyMap';
import { useEvents } from '@/components/hooks/useEvents';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const ChildTasks = ({ tasks }) => {
  if ((tasks || []).length === 0) {
    return (
      <div className="text-center py-6">
        <ClipboardCheck className="w-10 h-10 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500">כל המשימות הושלמו! 🎉</p>
      </div>
    );
  }
  return (
    <div className="space-y-3">
      {tasks.map(t => (
        <div key={t.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
          <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded-full" disabled />
          <div className="flex-1">
            <p className="font-medium text-slate-800">{t.title || t.description}</p>
            {t.due_date && (
              <p className="text-sm text-slate-500">
                יעד: {format(new Date(t.due_date), 'dd/MM/yyyy', { locale: he })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function ChildDashboardContent() {
  // Call ALL hooks at the top, before any conditional logic
  const { user, family, member } = useFamilyContext();
  
  const today = format(new Date(), 'yyyy-MM-dd');
  const todayName = format(new Date(), 'eeee', { locale: he }).toLowerCase();

  const { data: allTasks = [], isLoading: isLoadingTasks } = useTasks(family?.id, { activeOnly: true });
  const { data: completedTasks = [], isLoading: isLoadingCompleted } = useTasks(family?.id, { status: 'completed', from: today, to: today });
  const { data: custodyMap = {} } = useCustodyMap(family?.id, { from: today, to: today });
  const { data: upcomingEvents = [] } = useEvents(family?.id, { from: today, to: today }, { upcoming: true, limit: 3 });

  const myTodaysTasks = useMemo(() => {
    if (!allTasks || !user?.member_id) return [];
    const responsibleParentToday = custodyMap[today];
    return allTasks.filter(task => {
      if (!task.assigned_child_ids?.includes(user.member_id)) return false;
      const isForToday = task.is_recurring
        ? task.recurring_days?.includes(todayName)
        : task.due_date === today;
      if (!isForToday) return false;
      if (task.category === 'מטלות בית' && responsibleParentToday) {
        const taskCreatorName = task.created_by_parent?.replace(/^(אמא |אבא )/, '') || '';
        const responsibleParentName = responsibleParentToday.replace(/^(אמא |אבא )/, '') || '';
        return taskCreatorName === responsibleParentName;
      }
      return true;
    });
  }, [allTasks, user?.member_id, custodyMap, today, todayName]);

  const myCompletedTodayIds = useMemo(() => {
    return (completedTasks || [])
      .filter(ct => ct.child_id === user?.member_id)
      .map(ct => ct.task_id);
  }, [completedTasks, user?.member_id]);

  const pendingTasks = myTodaysTasks.filter(t => !myCompletedTodayIds.includes(t.id));

  // NOW we can do conditional rendering after all hooks have been called
  if (!member || !family || !user) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]" dir="rtl">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-slate-600">טוען את הדשבורד שלך...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          שלום {member.hebrew_name || user.full_name}!
        </h1>
        <p className="text-slate-600">
          {format(new Date(), 'EEEE, d MMMM yyyy', { locale: he })}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">המשימות שלי להיום</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">משימות פתוחות</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הניקוד שלי</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground">נקודות שנצברו</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אירועים קרובים</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingEvents.length}</div>
            <p className="text-xs text-muted-foreground">אירועים בשבוע הקרוב</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-green-500" />
            המשימות שלי להיום
          </CardTitle>
          <Link to={createPageUrl('MyTasks')}>
            <button className="border rounded-md px-3 py-1 text-sm">כל המשימות</button>
          </Link>
        </CardHeader>
        <CardContent>
          {isLoadingTasks || isLoadingCompleted
            ? <div className="flex justify-center py-6"><Loader2 className="w-6 h-6 animate-spin" /></div>
            : <ChildTasks tasks={pendingTasks} />
          }
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            אירועים קרובים
          </CardTitle>
          <Link to={createPageUrl('Calendar')}>
            <button className="border rounded-md px-3 py-1 text-sm">לוח שנה מלא</button>
          </Link>
        </CardHeader>
        <CardContent>
          {(upcomingEvents || []).length > 0 ? (
            <div className="space-y-2">
              {upcomingEvents.map(ev => (
                <div key={ev.id} className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <div className="p-2 bg-blue-100 rounded-full">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-800">{ev.title}</p>
                    <p className="text-sm text-slate-500">
                      {format(new Date(ev.date), 'EEEE, d MMMM yyyy', { locale: he })}
                      {ev.start_time && ` בשעה ${ev.start_time}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500">אין אירועים קרובים.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}