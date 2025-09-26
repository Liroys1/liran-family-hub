import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Users, ClipboardCheck, Calendar } from 'lucide-react';

export const CountsCard = ({ counts }) => {
  const safeCounts = counts || { children: 0, tasks_open: 0, events_this_week: 0 };

  return (
    <Card className="grid grid-cols-3 gap-4 p-4">
      <div className="text-center">
        <Users className="mx-auto h-6 w-6 text-blue-500 mb-1" />
        <p className="text-2xl font-bold">{safeCounts.children}</p>
        <p className="text-xs text-slate-500">ילדים</p>
      </div>
      <div className="text-center">
        <ClipboardCheck className="mx-auto h-6 w-6 text-green-500 mb-1" />
        <p className="text-2xl font-bold">{safeCounts.tasks_open}</p>
        <p className="text-xs text-slate-500">משימות פתוחות</p>
      </div>
      <div className="text-center">
        <Calendar className="mx-auto h-6 w-6 text-purple-500 mb-1" />
        <p className="text-2xl font-bold">{safeCounts.events_this_week}</p>
        <p className="text-xs text-slate-500">אירועים השבוע</p>
      </div>
    </Card>
  );
};