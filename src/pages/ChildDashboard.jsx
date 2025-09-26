/**
 * ChildDashboard.jsx - דשבורד עבור ילדים (שלד קל)
 * מציג משימות של הילד בלבד, לא חוסם אם member חסר
 */
import React from 'react';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/components/lib/base44';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Calendar, ClipboardCheck } from 'lucide-react';

export default function ChildDashboard() {
  const { user, family } = useFamilyContext();
  const fid = user.family_id || family?.id;
  
  // שליפת המשימות של הילד הספציפי
  const myTasksQ = useQuery({
    queryKey: ['tasks', fid, { child_only: user.member_id, status:'open' }],
    queryFn: () => entities.list('Task', { 
      family_id: fid, 
      child_id: user.member_id, 
      status: 'open', 
      fields: ['id','title','due_date'] 
    }),
    enabled: !!user.member_id && !!fid
  });

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* כותרת ידידותית לילדים */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">שלום {user?.full_name || 'חמוד/ה'}!</h1>
        <p className="text-gray-600">איך אתה היום? בוא נראה מה יש לך לעשות</p>
      </div>

      {/* כרטיסי סטטיסטיקה לילדים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">המשימות שלי</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{myTasksQ.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">משימות להיום</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">הנקודות שלי</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">🌟</div>
            <p className="text-xs text-muted-foreground">בקרוב...</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">אירועים</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">📅</div>
            <p className="text-xs text-muted-foreground">בקרוב...</p>
          </CardContent>
        </Card>
      </div>

      {/* משימות הילד */}
      <Card>
        <CardHeader>
          <CardTitle>המשימות שלי להיום</CardTitle>
        </CardHeader>
        <CardContent>
          {myTasksQ.isLoading ? (
            <p className="text-gray-500">טוען את המשימות שלך...</p>
          ) : (myTasksQ.data?.length || 0) > 0 ? (
            <ul className="space-y-3">
              {myTasksQ.data.map((t) => (
                <li key={t.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-600 rounded" disabled />
                  <span className="font-medium">{t.title}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-6">
              <p className="text-2xl mb-2">🎉</p>
              <p className="text-gray-500">כל המשימות הושלמו! כל הכבוד!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}