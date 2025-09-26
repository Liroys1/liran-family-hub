import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ClipboardCheck, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const MiniTaskItem = ({ task }) => (
    <div className="flex items-center justify-between text-sm py-2">
        <p className="truncate pr-2 text-slate-700">{task.description}</p>
        <CheckCircle2 className="w-4 h-4 text-slate-400" />
    </div>
);

export default function ChildTasks({ allData, onTaskComplete, selectedUser }) {
    
    // Logic from MyTasks is now here to ensure consistency
    const myTodaysTasks = React.useMemo(() => {
        const tasks = allData?.tasks || [];
        const custodyTemplate = allData?.custodyTemplate || null;
        const overrides = allData?.overrides || [];
        
        if (!Array.isArray(tasks) || !selectedUser) return [];
        
        const myTasks = tasks.filter(task => {
            if (!task.is_active) return false;
            return (task.assigned_child_ids && task.assigned_child_ids.includes(selectedUser.id)) || (task.child_id === selectedUser.id);
        });

        const today = new Date();
        const todayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];
        const todayString = today.toISOString().split('T')[0];

        const normalizeParentName = (parentName) => {
            if (!parentName) return '';
            return parentName.replace(/^(אמא |אבא )/, '');
        };

        const getResponsibleParent = (date, custodyTemplate, overrides) => {
            if (!custodyTemplate) return null;
            const dateString = typeof date === 'string' ? date : date.toISOString().split('T')[0];
            const override = (overrides || []).find(o => o.date === dateString);
            if (override) return normalizeParentName(override.responsible_parent);
            if (!custodyTemplate.start_date || !custodyTemplate.week_a || !custodyTemplate.week_b) return null;
            const targetDate = new Date(dateString);
            const dayOfWeek = targetDate.getDay();
            const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const dayKey = dayNames[dayOfWeek];
            const startDate = new Date(custodyTemplate.start_date);
            const startOfStartWeek = new Date(startDate);
            startOfStartWeek.setDate(startDate.getDate() - startDate.getDay());
            startOfStartWeek.setHours(0, 0, 0, 0);
            const startOfCurrentWeek = new Date(targetDate);
            startOfCurrentWeek.setDate(targetDate.getDate() - targetDate.getDay());
            startOfCurrentWeek.setHours(0, 0, 0, 0);
            const weeksDiff = Math.floor((startOfCurrentWeek - startOfStartWeek) / (7 * 24 * 60 * 60 * 1000));
            const isWeekA = weeksDiff % 2 === 0;
            if (isWeekA && custodyTemplate.week_a && custodyTemplate.week_a[dayKey]) return normalizeParentName(custodyTemplate.week_a[dayKey]);
            if (!isWeekA && custodyTemplate.week_b && custodyTemplate.week_b[dayKey]) return normalizeParentName(custodyTemplate.week_b[dayKey]);
            return null;
        };
        
        const responsibleParentToday = getResponsibleParent(today, custodyTemplate, overrides);
        
        return myTasks.filter(task => {
            if (task.is_recurring) {
                if (!task.recurring_days?.includes(todayName)) return false;
            } else {
                if (task.due_date !== todayString) return false;
            }
            if (task.category === 'מטלות בית') {
                if (responsibleParentToday) {
                    const taskCreator = normalizeParentName(task.created_by_parent);
                    return taskCreator === responsibleParentToday;
                }
                return true;
            }
            return true;
        });
    }, [allData, selectedUser]);

    const myCompletedToday = React.useMemo(() => {
        const completedTasks = allData?.completedTasks || [];
        if (!Array.isArray(completedTasks) || !selectedUser) return [];
        const todayStr = new Date().toISOString().split('T')[0];
        return completedTasks
            .filter(ct => ct.child_id === selectedUser.id && ct.completion_date?.startsWith(todayStr))
            .map(ct => ct.task_id);
    }, [allData, selectedUser]);

    const safeTasks = Array.isArray(myTodaysTasks) ? myTodaysTasks : [];
    const completedCount = Array.isArray(myCompletedToday) ? myCompletedToday.length : 0;
    const totalTasks = safeTasks.length;
    const pendingTasks = safeTasks.filter(t => !myCompletedToday.includes(t.id));

    if (!allData) {
        return (
            <div className="flex items-center justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin" />
            </div>
        );
    }
    
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between font-semibold">
                <span className="text-slate-600">התקדמות</span>
                <span>{completedCount} / {totalTasks}</span>
            </div>
            
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div 
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                    style={{ width: totalTasks > 0 ? `${(completedCount / totalTasks) * 100}%` : '0%' }}
                ></div>
            </div>

            {totalTasks > 0 ? (
                <>
                    <div className="space-y-2 pt-2 border-t">
                        {pendingTasks.slice(0, 2).map(task => (
                            <MiniTaskItem key={task.id} task={task} />
                        ))}
                    </div>
                    {pendingTasks.length === 0 && (
                        <div className="text-center py-4 text-green-600">
                             <ClipboardCheck className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-semibold">כל הכבוד! סיימת הכל להיום!</p>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-4 text-slate-500">
                    <ClipboardCheck className="w-8 h-8 mx-auto mb-2" />
                    <p>אין משימות להיום.</p>
                </div>
            )}
            
            <Button variant="outline" className="w-full" asChild>
                <Link to={createPageUrl('MyTasks')}>ראה את כל המשימות</Link>
            </Button>
        </div>
    );
}
