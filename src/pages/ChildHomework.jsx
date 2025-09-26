
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Homework, Child } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, BookOpen, Clock, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { he } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const HomeworkItem = ({ homework, subjectName, onStatusChange }) => {
    const isOverdue = isPast(new Date(homework.due_date)) && !isToday(new Date(homework.due_date)) && homework.status !== 'completed';
    
    return (
        <Card className={`shadow-md transition-all duration-200 ${isOverdue ? 'border-red-500 bg-red-50' : ''}`}>
            <CardHeader className="flex flex-row justify-between items-start pb-2">
                <div>
                    <CardTitle className="text-lg">{homework.title}</CardTitle>
                    <Badge variant="outline" className="mt-1">{subjectName || 'לא ידוע'}</Badge>
                </div>
                <div className="text-sm text-slate-500 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{format(new Date(homework.due_date), 'dd/MM/yy')}</span>
                    {isOverdue && <Badge variant="destructive">איחור</Badge>}
                </div>
            </CardHeader>
            <CardContent>
                <p className="text-slate-600 mb-4">{homework.description}</p>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {homework.status === 'pending' && (
                            <Button size="sm" onClick={() => onStatusChange(homework, 'in_progress')}>
                                <Clock className="w-4 h-4 ml-2" />
                                התחלתי
                            </Button>
                        )}
                        {homework.status === 'in_progress' && (
                            <Button size="sm" onClick={() => onStatusChange(homework, 'completed')} className="bg-green-600 hover:bg-green-700">
                                <CheckCircle2 className="w-4 h-4 ml-2" />
                                סיימתי
                            </Button>
                        )}
                    </div>
                    <Badge variant={
                        homework.status === 'completed' ? 'default' : 
                        homework.status === 'in_progress' ? 'secondary' : 'outline'
                    } className={
                        homework.status === 'completed' ? 'bg-green-100 text-green-800' : ''
                    }>
                        {homework.status === 'completed' ? 'הושלם' : homework.status === 'in_progress' ? 'בתהליך' : 'ממתין'}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
};

export default function ChildHomeworkPage({ user, allData, refreshData, isLoading: isLayoutLoading }) {
    const [isLoading, setIsLoading] = useState(true);
    const { homework: allHomework, subjects } = allData;

    useEffect(() => {
        if (!isLayoutLoading) {
            setIsLoading(false);
        }
    }, [isLayoutLoading, allData]);

    const myHomework = useMemo(() => {
        if (!allHomework || !user) return [];
        return allHomework.filter(hw => hw.child_id === user.id).sort((a,b) => new Date(a.due_date) - new Date(b.due_date));
    }, [allHomework, user]);

    const handleStatusChange = async (homeworkToUpdate, newStatus) => {
        try {
            await Homework.update(homeworkToUpdate.id, { status: newStatus });
            refreshData();
        } catch (error) {
            console.error("Failed to update homework status:", error);
            alert("שגיאה בעדכון הסטטוס.");
        }
    };
    
    if (isLoading || !user) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    const pendingTasks = myHomework.filter(hw => hw.status === 'pending' || hw.status === 'in_progress');
    const completedTasks = myHomework.filter(hw => hw.status === 'completed');

    return (
        <div className="p-4 md:p-8 space-y-8" dir="rtl">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">שיעורי הבית שלי</h1>
                <p className="text-slate-600">כאן תוכל לעקוב אחר כל המשימות שלך ולעדכן אותנו כשתסיים.</p>
            </div>
            
            <Tabs defaultValue="pending">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pending">משימות ממתינות ({pendingTasks.length})</TabsTrigger>
                    <TabsTrigger value="completed">משימות שהושלמו ({completedTasks.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="pending" className="pt-6 space-y-4">
                    {pendingTasks.length > 0 ? (
                        pendingTasks.map(hw => {
                            const subject = subjects?.find(s => s.id === hw.subject_id);
                            return <HomeworkItem key={hw.id} homework={hw} onStatusChange={handleStatusChange} subjectName={subject?.hebrew_name} />
                        })
                    ) : (
                        <Card className="text-center p-12">
                            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-slate-800">כל הכבוד!</h3>
                            <p className="text-slate-600">סיימת את כל שיעורי הבית. זמן למשחק!</p>
                        </Card>
                    )}
                </TabsContent>
                <TabsContent value="completed" className="pt-6 space-y-4">
                     {completedTasks.map(hw => {
                        const subject = subjects?.find(s => s.id === hw.subject_id);
                        return <HomeworkItem key={hw.id} homework={hw} onStatusChange={handleStatusChange} subjectName={subject?.hebrew_name} />
                    })}
                </TabsContent>
            </Tabs>
        </div>
    );
}
