import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const getWeekDateRange = () => {
    const now = new Date();
    
    const startOfWeek = new Date(now);
    const dayOfWeek = startOfWeek.getDay();
    startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
    startOfWeek.setHours(6, 0, 0, 0);
    
    if (now < startOfWeek) {
        startOfWeek.setDate(startOfWeek.getDate() - 7);
    }
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    endOfWeek.setHours(20, 0, 0, 0);
    
    return { start: startOfWeek, end: endOfWeek };
};

export default function Leaderboard({ completedTasks, children, currentUserId, mode = 'parent' }) {

    const weeklyCompleted = useMemo(() => {
        if (!completedTasks) return [];
        const { start, end } = getWeekDateRange();
        return completedTasks.filter(ct => {
            const completionDate = new Date(ct.completion_date);
            return completionDate >= start && completionDate <= end;
        });
    }, [completedTasks]);

    const weeklyScores = useMemo(() => {
        if (!weeklyCompleted || !children) return [];

        const scores = children.map(child => {
            const childCompleted = weeklyCompleted.filter(ct => ct.child_id === child.id);
            const totalPoints = childCompleted.reduce((sum, task) => sum + (task.points_awarded || 0), 0);
            const completedCount = childCompleted.length;
            return {
                ...child,
                points: totalPoints,
                completedCount: completedCount,
            };
        });

        return scores.sort((a, b) => b.points - a.points);
    }, [weeklyCompleted, children]);

    if (weeklyScores.length === 0) {
        return (
            <Card>
                <CardHeader><CardTitle>טבלת הניקוד השבועית</CardTitle></CardHeader>
                <CardContent><p className="text-center text-slate-500">עדיין לא נצברו נקודות השבוע.</p></CardContent>
            </Card>
        );
    }
    
    const firstPlace = weeklyScores[0];
    const others = weeklyScores.slice(1);
    const currentUserIndexInOthers = others.findIndex(c => c.id === currentUserId);

    if (mode === 'child' && firstPlace.id === currentUserId) {
        // If current user is in first place, no need to highlight anyone in 'others'
    } else if (mode === 'child' && currentUserIndexInOthers !== -1) {
        // If current user is in 'others', move them to the top of the 'others' list
        const currentUserData = others.splice(currentUserIndexInOthers, 1)[0];
        others.unshift(currentUserData);
    }

    const renderChildCard = (child, isFirstPlace, isCurrentUser) => (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={`p-4 rounded-xl flex items-center gap-4 ${isFirstPlace ? 'bg-yellow-50 border-2 border-yellow-200' : 'bg-slate-50'} ${isCurrentUser ? 'ring-2 ring-blue-500' : ''}`}
        >
            <Avatar className="w-12 h-12">
                <AvatarImage src={child.image_url} />
                <AvatarFallback style={{backgroundColor: child.color, color: 'white'}}>{child.hebrew_name[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <p className="font-bold text-slate-800">{child.hebrew_name}</p>
                <p className="text-sm text-slate-500">משימות השבוע: {child.completedCount}</p>
            </div>
            <div className="flex items-center gap-2 text-xl font-bold text-yellow-600">
                <Star className="w-5 h-5" />
                {child.points}
            </div>
            {isFirstPlace && <Award className="w-6 h-6 text-yellow-500" />}
        </motion.div>
    );

    return (
        <Card>
            <CardHeader><CardTitle>טבלת הניקוד השבועית</CardTitle></CardHeader>
            <CardContent className="space-y-3">
                {renderChildCard(firstPlace, true, mode === 'child' && firstPlace.id === currentUserId)}

                {others.length > 0 && <hr />}

                {others.map(child => renderChildCard(child, false, mode === 'child' && child.id === currentUserId))}
            </CardContent>
        </Card>
    );
}
