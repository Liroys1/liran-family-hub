import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, Check, ClipboardCheck, BookOpen, Home, User as UserIcon } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import hooks
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useTasks, useCompleteTask } from '@/components/hooks/useTasks';
import { useCustodyMap } from '@/components/hooks/useCustody';
import { format } from 'date-fns';

const getCategoryIcon = (category) => {
    switch(category) {
        case 'מטלות בית':
            return <Home className="w-4 h-4" />;
        case 'שיעורי בית':
            return <BookOpen className="w-4 h-4" />;
        default:
            return <UserIcon className="w-4 h-4" />;
    }
};

const normalizeParentName = (parentName) => {
    if (!parentName) return '';
    return parentName.replace(/^(אמא |אבא )/, '');
};

const TaskItem = ({ task, onComplete, isCompleted, childMemberId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const completeTaskMutation = useCompleteTask();

    const handleComplete = async () => {
        setIsLoading(true);
        try {
            await onComplete(task, childMemberId);
        } catch (error) {
            console.error("Error completing task in TaskItem:", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {getCategoryIcon(task.category)}
                    <div>
                        <p className={`font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.description}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>{task.category}</span>
                            {task.created_by_parent && (
                                <span> • נוצר על ידי {task.created_by_parent}</span>
                            )}
                        </div>
                    </div>
                </div>
                {!isCompleted && (
                    <Button size="sm" onClick={handleComplete} disabled={isLoading || completeTaskMutation.isPending}>
                        {isLoading || completeTaskMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        סיימתי
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default function MyTasksPage() {
    const { user, family } = useFamilyContext();
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    const todayName = format(today, 'eeee').toLowerCase();

    // --- Data Fetching with Hooks ---
    const { data: allTasks, isLoading: isLoadingTasks } = useTasks(family?.id, { activeOnly: true });
    const { data: completedTasks, isLoading: isLoadingCompleted } = useTasks(family?.id, { status: 'completed', from: todayString, to: todayString });
    const custodyMap = useCustodyMap(family?.id, { from: todayString, to: todayString });
    
    // --- Mutations ---
    const completeTaskMutation = useCompleteTask();
    
    const myTodaysTasks = useMemo(() => {
        if (!allTasks || !user) return [];
        
        const responsibleParentToday = custodyMap[todayString];

        return allTasks.filter(task => {
            // Must be assigned to me
            if (!task.assigned_child_ids?.includes(user.member_id)) return false;

            // Check if it's for today
            const isForToday = task.is_recurring ? task.recurring_days?.includes(todayName) : task.due_date === todayString;
            if (!isForToday) return false;
            
            // For household chores, check if the creator is the responsible parent today
            if (task.category === 'מטלות בית' && responsibleParentToday) {
                const taskCreator = normalizeParentName(task.created_by_parent);
                return taskCreator === normalizeParentName(responsibleParentToday);
            }

            return true;
        });
    }, [allTasks, user, custodyMap, todayString, todayName]);

    const myCompletedTodayIds = useMemo(() => {
        if (!completedTasks) return [];
        return completedTasks
            .filter(ct => ct.child_id === user.member_id)
            .map(ct => ct.task_id);
    }, [completedTasks, user.member_id]);

    const handleCompleteTask = async (task, childMemberId) => {
        if (!user || !family) return;
        try {
            await completeTaskMutation.mutateAsync({
                family_id: family.id,
                child_id: childMemberId,
                task_id: task.id,
                task_title: task.description,
                task_category: task.category,
                points_awarded: task.points || 0,
            });
        } catch (error) {
            console.error("Failed to complete task:", error);
            alert("שגיאה בסימון המשימה. נסה שוב.");
        }
    };
    
    if (isLoadingTasks || isLoadingCompleted) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    const pendingTasks = myTodaysTasks.filter(t => !myCompletedTodayIds.includes(t.id));
    const completedTasksToday = myTodaysTasks.filter(t => myCompletedTodayIds.includes(t.id));

    return (
        <div className="p-4 md:p-8 space-y-8" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">המשימות שלי</h1>
                <p className="text-slate-600">השלם את כל המשימות שלך להיום.</p>
            </div>

            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">משימות להיום ({pendingTasks.length || 0})</TabsTrigger>
                    <TabsTrigger value="completed">הושלמו היום ({completedTasksToday.length || 0})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="space-y-4 pt-4">
                    {pendingTasks.length > 0 ? (
                        pendingTasks.map(task => (
                            <TaskItem key={task.id} task={task} onComplete={handleCompleteTask} isCompleted={false} childMemberId={user.member_id} />
                        ))
                    ) : (
                        <Card className="text-center p-12">
                            <ClipboardCheck className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            {myTodaysTasks.length === 0 ? (
                                <>
                                    <h3 className="text-xl font-semibold text-slate-600">אין משימות להיום</h3>
                                    <p className="text-slate-500">נהדר! אין לך משימות שהוגדרו להיום.</p>
                                </>
                            ) : (
                                <>
                                    <h3 className="text-xl font-semibold text-green-600">סיימת הכל להיום!</h3>
                                    <p className="text-slate-600">עבודה נהדרת! מנוחה קצרה וחוזרים מחר.</p>
                                </>
                            )}
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="completed" className="space-y-4 pt-4">
                    {completedTasksToday.length > 0 ? (
                      completedTasksToday.map(task => (
                        <TaskItem key={task.id} task={task} onComplete={() => {}} isCompleted={true} childMemberId={user.member_id} />
                      ))
                    ) : (
                      <div className="text-center p-12 text-slate-500">עדיין לא השלמת משימות היום.</div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}