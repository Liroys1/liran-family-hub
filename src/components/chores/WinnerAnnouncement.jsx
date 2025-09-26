import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Award, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const getPreviousWeekRange = () => {
    const now = new Date();
    
    // Find the current week's start (Sunday 6:00 AM)
    const startOfThisWeek = new Date(now);
    const dayOfWeek = startOfThisWeek.getDay();
    startOfThisWeek.setDate(startOfThisWeek.getDate() - dayOfWeek);
    startOfThisWeek.setHours(6, 0, 0, 0);
    
    // If we're before Sunday 6:00 AM, the current week hasn't started yet
    if (now < startOfThisWeek) {
        startOfThisWeek.setDate(startOfThisWeek.getDate() - 7);
    }
    
    // Previous week ends right before this week starts
    const endOfPrevWeek = new Date(startOfThisWeek.getTime() - 1);
    
    // Previous week starts 7 days before this week
    const startOfPrevWeek = new Date(startOfThisWeek);
    startOfPrevWeek.setDate(startOfPrevWeek.getDate() - 7);
    
    return { start: startOfPrevWeek, end: endOfPrevWeek };
};

const isTimeToAnnounceWinner = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // Sunday is 0, Saturday is 6
    const hour = now.getHours();

    // Announce winner from Saturday 8 PM until Sunday 6 AM
    if (dayOfWeek === 6 && hour >= 20) { // Saturday 8 PM onwards
        return true;
    }
    if (dayOfWeek === 0 && hour < 6) { // Sunday before 6 AM
        return true;
    }
    return false;
};

export default function WinnerAnnouncement({ completedChores, children }) {

    const weeklyWinner = useMemo(() => {
        if (!isTimeToAnnounceWinner() || !completedChores || !children) return null;

        const { start, end } = getPreviousWeekRange();
        
        const prevWeekCompleted = completedChores.filter(cc => {
            const completionDate = new Date(cc.completion_date);
            return completionDate >= start && completionDate <= end;
        });

        if (prevWeekCompleted.length === 0) return null;

        const scores = children.map(child => {
            const childCompleted = prevWeekCompleted.filter(cc => cc.child_id === child.id);
            const totalPoints = childCompleted.reduce((sum, chore) => sum + (chore.points_awarded || 0), 0);
            return {
                ...child,
                points: totalPoints,
            };
        });

        const sortedScores = scores.sort((a, b) => b.points - a.points);
        const winner = sortedScores[0];

        // Ensure there is a winner with points
        return winner && winner.points > 0 ? winner : null;
        
    }, [completedChores, children]);

    if (!weeklyWinner) {
        return null; // Don't render anything if it's not time or there's no winner
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 100, damping: 10 }}
        >
            <Card className="bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-300 border-2 border-yellow-400 shadow-2xl">
                <CardHeader className="text-center">
                    <Award className="w-16 h-16 text-white mx-auto bg-yellow-500 rounded-full p-2" />
                    <CardTitle className="text-2xl font-bold text-yellow-900 mt-2">מנצח/ת השבוע!</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                    <Avatar className="w-24 h-24 mx-auto ring-4 ring-white ring-offset-2 ring-offset-yellow-400">
                        <AvatarImage src={weeklyWinner.image_url} />
                        <AvatarFallback style={{backgroundColor: weeklyWinner.color, color: 'white'}}>{weeklyWinner.hebrew_name[0]}</AvatarFallback>
                    </Avatar>
                    <p className="text-3xl font-extrabold text-white text-shadow-lg mt-4">{weeklyWinner.hebrew_name}</p>
                    <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-800 mt-2">
                        <Star className="w-6 h-6" />
                        {weeklyWinner.points} נקודות
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}