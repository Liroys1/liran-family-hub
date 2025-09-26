import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';

export const NextEventsList = ({ items, limit = 5 }) => {
  const safeItems = (items || []).slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Calendar className="h-5 w-5 text-purple-500" />
          אירועים קרובים
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeItems.length > 0 ? (
          <ul className="space-y-3">
            {safeItems.map(item => (
              <li key={item.id} className="flex items-start gap-3">
                <div className="font-medium text-slate-800 text-sm">
                  {format(new Date(item.date), 'EEE', { locale: he })}
                  <br />
                  <span className="text-lg">{format(new Date(item.date), 'd')}</span>
                </div>
                <div className="border-r-2 border-purple-200 pr-3">
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.start_time ? `${item.start_time}` : 'כל היום'}</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-500 py-4">אין אירועים קרובים</p>
        )}
      </CardContent>
    </Card>
  );
};