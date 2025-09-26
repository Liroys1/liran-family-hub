import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

export default function TasksOverview({ tasks, children }) {

    const getChildName = (childId) => {
        const child = children?.find(c => c.member_id === childId);
        return child?.hebrew_name || 'לא ידוע';
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'ללא תאריך';
        const date = new Date(dateString);
        if (isToday(date)) return 'היום';
        if (isPast(date)) return <span className="text-red-500 font-semibold">{format(date, 'dd/MM')} - באיחור</span>;
        return format(date, 'dd/MM/yy');
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>משימות פתוחות</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="space-y-3">
                    {tasks && tasks.length > 0 ? (
                        tasks.slice(0, 10).map(task => (
                            <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Circle className="w-5 h-5 text-slate-400" />
                                    <div>
                                        <p className="font-semibold text-slate-800">{task.description}</p>
                                        <p className="text-xs text-slate-500">
                                            {task.category} • {task.assigned_member_ids?.map(getChildName).join(', ') || 'כולם'}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-sm text-slate-600 font-medium">
                                    {formatDate(task.due_date)}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8">
                             <CheckCircle2 className="w-12 h-12 text-green-400 mx-auto mb-4" />
                            <p className="text-slate-500">אין משימות פתוחות. כל הכבוד!</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}