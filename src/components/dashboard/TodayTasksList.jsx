import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClipboardCheck } from 'lucide-react';

export const TodayTasksList = ({ items, limit = 8 }) => {
  const safeItems = (items || []).slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ClipboardCheck className="h-5 w-5 text-green-500" />
          משימות להיום
        </CardTitle>
      </CardHeader>
      <CardContent>
        {safeItems.length > 0 ? (
          <ul className="space-y-2">
            {safeItems.map(item => (
              <li key={item.id} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                <input type="checkbox" className="h-4 w-4" disabled />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-500 py-4">🎉 אין משימות להיום!</p>
        )}
      </CardContent>
    </Card>
  );
};