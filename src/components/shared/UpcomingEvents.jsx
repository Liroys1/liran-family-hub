import React from 'react';
import { Card } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';

// Simple static version for now - no useFamilyContext calls
export default function UpcomingEvents({ limit = 5 }) {
    return (
        <div className="space-y-3">
            <div className="text-center p-6 text-slate-500">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p>אין אירועים קרובים</p>
                <p className="text-xs mt-1">האירועים יוצגו כאן כשיהיו</p>
            </div>
        </div>
    );
}