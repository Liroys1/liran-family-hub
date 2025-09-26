import React, { useState, useMemo } from 'react';
import { AuditLog, Task } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Edit, Trash2, Home, BookCopy, User as UserIcon, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

// Import hooks
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useChildrenWithMembers } from '@/components/hooks/useChildrenWithMembers';
import { useMembers } from '@/components/hooks/useMembers';
import { useSchedulesData } from '@/components/hooks/useSchedules'; 
import { 
  useTasks, 
  useMyHouseTasks, 
  useVariableHouseTasks, 
  useChildHomework, 
  useAllVisibleTasks, 
  useCreateTask, 
  useUpdateTask, 
  useDeleteTask 
} from '@/components/hooks/useTasks';

import TaskForm from '@/components/tasks/TaskForm';

const TASK_KIND_ICONS = {
  'house_fixed': <Home className="w-4 h-4" />,
  'house_variable': <Home className="w-4 h-4" />,
  'child_homework': <BookCopy className="w-4 h-4" />,
  'other': <UserIcon className="w-4 h-4" />
};

const TASK_KIND_COLORS = {
  'house_fixed': 'bg-purple-100 text-purple-800',
  'house_variable': 'bg-blue-100 text-blue-800', 
  'child_homework': 'bg-green-100 text-green-800',
  'other': 'bg-gray-100 text-gray-800'
};

const VISIBILITY_COLORS = {
  'owner_only': 'bg-red-100 text-red-800',
  'parents_only': 'bg-yellow-100 text-yellow-800',
  'family': 'bg-green-100 text-green-800'
};

export default function ManageTasksPage() {
    const { user, family } = useFamilyContext();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [activeTab, setActiveTab] = useState('mine');

    // --- Data Fetching with Hooks ---
    const { data: children, isLoading: isLoadingChildren } = useChildrenWithMembers(family?.id);
    const { data: members, isLoading: isLoadingMembers } = useMembers(family?.id);
    const { data: schedulesData, isLoading: isLoadingSchedules } = useSchedulesData(family?.id);

    // Different task views based on tabs
    const { data: myTasks, isLoading: isLoadingMy, refetch: refetchMy } = useMyHouseTasks(family?.id);
    const { data: variableTasks, isLoading: isLoadingVariable, refetch: refetchVariable } = useVariableHouseTasks(family?.id);
    const { data: homeworkTasks, isLoading: isLoadingHomework, refetch: refetchHomework } = useTasks(family?.id, { kind: 'child_homework' });
    const { data: allTasks, isLoading: isLoadingAll, refetch: refetchAll } = useAllVisibleTasks(family?.id);

    // --- Mutations with Hooks ---
    const createTaskMutation = useCreateTask();
    const updateTaskMutation = useUpdateTask();
    const deleteTaskMutation = useDeleteTask();

    const handleSaveTask = async (taskData) => {
        try {
            if (editingTask) {
                await updateTaskMutation.mutateAsync({ id: editingTask.id, ...taskData });
                await AuditLog.create({
                    family_id: family.id,
                    entity_type: 'Task',
                    entity_id: editingTask.id,
                    action: 'update',
                    details: `עדכון משימה: ${taskData.description}`,
                    user_name: user?.hebrew_name || 'לא ידוע'
                });
            } else {
                const newTask = await createTaskMutation.mutateAsync({ ...taskData, family_id: family.id });
                await AuditLog.create({
                    family_id: family.id,
                    entity_type: 'Task',
                    entity_id: newTask?.id || 'new',
                    action: 'create',
                    details: `יצירת משימה: ${taskData.description}`,
                    user_name: user?.hebrew_name || 'לא ידוע'
                });
            }
            setIsFormOpen(false);
            setEditingTask(null);
            // Refetch all relevant data
            refetchMy();
            refetchVariable();
            refetchHomework();
            refetchAll();
        } catch (error) {
            console.error("Failed to save task:", error);
            alert("שגיאה בשמירת המשימה.");
        }
    };

    const handleEdit = (task) => {
        if (user?.family_role !== 'parent') return;
        setEditingTask(task);
        setIsFormOpen(true);
    };

    const handleDelete = async (taskId) => {
        if (user?.family_role !== 'parent') return;
        if (!window.confirm("האם למחוק את המשימה לצמיתות?")) return;
        try {
            const taskToDelete = allTasks?.find(t => t.id === taskId);
            await deleteTaskMutation.mutateAsync(taskId);
            await AuditLog.create({
                family_id: family.id,
                entity_type: 'Task',
                entity_id: taskId,
                action: 'delete',
                details: `מחיקת משימה: ${taskToDelete?.description || 'לא ידוע'}`,
                user_name: user?.hebrew_name || 'לא ידוע'
            });
            // Refetch all relevant data
            refetchMy();
            refetchVariable(); 
            refetchHomework();
            refetchAll();
        } catch (error) {
            console.error("Failed to delete task:", error);
            alert("שגיאה במחיקת המשימה.");
        }
    };

    const isReadOnly = user?.family_role !== 'parent';

    // Task lists for different tabs
    const taskLists = {
        mine: myTasks || [],
        variable: variableTasks || [],
        homework: homeworkTasks || [],
        all: allTasks || []
    };

    const isLoading = isLoadingChildren || isLoadingMembers || isLoadingSchedules || 
                     isLoadingMy || isLoadingVariable || isLoadingHomework || isLoadingAll;

    const getOwnerName = (ownerId) => {
        const owner = members?.find(m => m.id === ownerId);
        return owner?.hebrew_name || 'לא ידוע';
    };

    const getChildName = (childId) => {
        const child = children?.find(c => c.id === childId);
        return child?.hebrew_name || 'לא ידוע';
    };

    const TaskCard = ({ task }) => (
        <Card key={task.id} className="overflow-hidden">
            <CardContent className="p-4">
                <div className="space-y-3">
                    <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0 pr-2">
                            <h3 className="font-bold text-lg leading-tight break-words">
                                {task.title || task.description}
                            </h3>
                            {task.title && task.title !== task.description && (
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-slate-600 mt-2 flex-wrap">
                                <Badge className={TASK_KIND_COLORS[task.kind]} variant="secondary">
                                    {TASK_KIND_ICONS[task.kind]}
                                    <span className="ml-1">
                                        {task.kind === 'house_fixed' && 'מטלות בית קבועות'}
                                        {task.kind === 'house_variable' && 'מטלות בית משתנות'}
                                        {task.kind === 'child_homework' && 'שיעורי בית'}
                                        {task.kind === 'other' && 'אחר'}
                                    </span>
                                </Badge>
                                <Badge className={VISIBILITY_COLORS[task.visibility_scope]} variant="outline">
                                    {task.visibility_scope === 'owner_only' && 'בעלים בלבד'}
                                    {task.visibility_scope === 'parents_only' && 'הורים בלבד'}
                                    {task.visibility_scope === 'family' && 'משפחה כולה'}
                                </Badge>
                                {task.owner_member_id && (
                                    <Badge variant="outline">
                                        בעלים: {getOwnerName(task.owner_member_id)}
                                    </Badge>
                                )}
                                {task.child_id && (
                                    <Badge variant="outline">
                                        ילד: {getChildName(task.child_id)}
                                    </Badge>
                                )}
                            </div>
                            {task.tags && task.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {task.tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="text-xs">#{tag}</Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                        {!isReadOnly && (
                            <div className="flex items-center gap-1 ml-2">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(task)} className="h-8 w-8">
                                    <Edit className="w-4 h-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="h-8 w-8">
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        )}
                    </div>
                    
                    {(task.due_date || task.due_time || task.is_recurring) && (
                        <div className="flex items-center justify-between pt-2 border-t text-sm">
                            <div>
                                {task.due_date && <span>יעד: {task.due_date}</span>}
                                {task.due_time && <span className="mr-2">שעה: {task.due_time}</span>}
                            </div>
                            {task.is_recurring && (
                                <Badge variant="outline" className="text-xs">
                                    חוזר
                                </Badge>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div className="p-4 md:p-8 space-y-8" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">ניהול משימות</h1>
                {!isReadOnly && (
                    <Button onClick={() => { setEditingTask(null); setIsFormOpen(true); }}>
                        <Plus className="w-4 h-4 ml-2" /> הוסף משימה
                    </Button>
                )}
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent className="max-w-4xl">
                    <DialogHeader>
                        <DialogTitle>{editingTask ? 'עריכת משימה' : 'משימה חדשה'}</DialogTitle>
                    </DialogHeader>
                    <div className="max-h-[80vh] overflow-y-auto p-1">
                        <TaskForm
                            task={editingTask}
                            childrenList={children || []}
                            membersList={members || []}
                            subjectsList={schedulesData?.subjects || []}
                            allTasks={allTasks || []}
                            onSave={handleSaveTask}
                            onCancel={() => {
                                setIsFormOpen(false);
                                setEditingTask(null);
                            }}
                            user={user}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <Tabs defaultValue="mine" className="w-full" onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="mine">שלי ({taskLists.mine.length})</TabsTrigger>
                    <TabsTrigger value="variable">משתנות ({taskLists.variable.length})</TabsTrigger>
                    <TabsTrigger value="homework">של הילדים ({taskLists.homework.length})</TabsTrigger>
                    <TabsTrigger value="all">הכל ({taskLists.all.length})</TabsTrigger>
                </TabsList>

                {['mine', 'variable', 'homework', 'all'].map(tab => (
                    <TabsContent key={tab} value={tab} className="space-y-4">
                        {taskLists[tab].length > 0 ? (
                            <div className="grid gap-4">
                                {taskLists[tab].map(task => (
                                    <TaskCard key={task.id} task={task} />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center p-8">
                                <Plus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">
                                    {tab === 'mine' && 'לא הוגדרו עדיין מטלות בית קבועות שלך'}
                                    {tab === 'variable' && 'לא הוגדרו עדיין מטלות בית משתנות'}
                                    {tab === 'homework' && 'לא הוגדרו עדיין שיעורי בית'}
                                    {tab === 'all' && 'לא הוגדרו עדיין משימות פעילות'}
                                </p>
                            </div>
                        )}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
}