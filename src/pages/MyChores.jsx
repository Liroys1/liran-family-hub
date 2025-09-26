import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Chore, CompletedChore } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Star, Check, ClipboardCheck } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Leaderboard from '@/components/chores/Leaderboard';
import WinnerAnnouncement from '@/components/chores/WinnerAnnouncement';

const ChoreItem = ({ chore, onComplete, isCompleted, childId }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleComplete = async () => {
        setIsLoading(true);
        await onComplete(chore);
        // No need to set loading to false, as the component will re-render and disappear
    };

    return (
        <Card className="shadow-md hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ClipboardCheck className={`w-6 h-6 ${isCompleted ? 'text-green-500' : 'text-blue-500'}`} />
                    <div>
                        <p className={`font-semibold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-800'}`}>{chore.title}</p>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>{chore.category}</span>
                            {chore.points > 0 && (
                                <span className="flex items-center gap-1 font-bold text-yellow-500">
                                    <Star className="w-4 h-4" /> {chore.points}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {!isCompleted && (
                    <Button size="sm" onClick={handleComplete} disabled={isLoading}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                        סיימתי
                    </Button>
                )}
            </CardContent>
        </Card>
    );
};

export default function MyChoresPage({ user, allData, refreshData, isLoading: isLayoutLoading }) {
    const [isLoading, setIsLoading] = useState(true);

    const { chores, completedChores, children, afterSchoolOverrides } = allData;

    useEffect(() => {
        if (!isLayoutLoading) {
            setIsLoading(false);
        }
    }, [isLayoutLoading]);

    const myTodaysChores = useMemo(() => {
        if (!chores || !user) return [];
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
        
        return chores.filter(chore =>
            chore.is_active &&
            chore.assigned_child_ids?.includes(user.id) &&
            (
                (chore.is_recurring && chore.recurring_days?.includes(today)) ||
                (!chore.is_recurring && chore.due_date === new Date().toISOString().split('T')[0])
            )
        );
    }, [chores, user]);

    const myCompletedToday = useMemo(() => {
        if (!completedChores || !user) return [];
        const todayStr = new Date().toISOString().split('T')[0];
        return completedChores.filter(cc => 
            cc.child_id === user.id && 
            cc.completion_date?.startsWith(todayStr)
        ).map(cc => cc.chore_id);
    }, [completedChores, user]);

    const handleCompleteChore = async (chore) => {
        if (!user) return;
        try {
            await CompletedChore.create({
                child_id: user.id,
                chore_id: chore.id,
                chore_title: chore.title,
                points_awarded: chore.points || 0,
                completion_date: new Date().toISOString(),
            });
            await refreshData();
        } catch (error) {
            console.error("Failed to complete chore:", error);
            alert("שגיאה בסימון המשימה. נסה שוב.");
        }
    };
    
    if (isLoading || !user) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    const pendingChores = myTodaysChores.filter(c => !myCompletedToday.includes(c.id));
    const completedChoresToday = myTodaysChores.filter(c => myCompletedToday.includes(c.id));

    return (
        <div className="p-4 md:p-8 space-y-8" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">המשימות שלי</h1>
                <p className="text-slate-600">כל הכבוד על המאמץ! כל משימה שאתה מסיים מקרבת אותך לניצחון.</p>
            </div>
            
            <WinnerAnnouncement completedChores={completedChores} children={children} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Tabs defaultValue="pending">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="pending">משימות להיום ({pendingChores.length})</TabsTrigger>
                            <TabsTrigger value="completed">הושלמו היום ({completedChoresToday.length})</TabsTrigger>
                        </TabsList>
                        <TabsContent value="pending" className="space-y-4 pt-4">
                            {pendingChores.length > 0 ? (
                                pendingChores.map(chore => (
                                    <ChoreItem key={chore.id} chore={chore} onComplete={handleCompleteChore} isCompleted={false} childId={user.id} />
                                ))
                            ) : (
                                <Card className="text-center p-12">
                                    <Star className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-slate-800">סיימת הכל להיום!</h3>
                                    <p className="text-slate-600">עבודה נהדרת! מנוחה קצרה וחוזרים מחר.</p>
                                </Card>
                            )}
                        </TabsContent>
                        <TabsContent value="completed" className="space-y-4 pt-4">
                            {completedChoresToday.map(chore => (
                                <ChoreItem key={chore.id} chore={chore} onComplete={() => {}} isCompleted={true} childId={user.id} />
                            ))}
                        </TabsContent>
                    </Tabs>
                </div>
                
                <div className="space-y-8">
                   <Leaderboard 
                        completedChores={completedChores} 
                        children={children} 
                        currentUserId={user.id}
                        mode="child"
                   />
                </div>
            </div>
        </div>
    );
}