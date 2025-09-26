/**
 * ParentDashboard.jsx - דשבורד עבור הורים (שלד קל)
 * לא חוסם אם member חסר, עובד עם המינימום הנדרש
 */
import React from 'react';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/components/lib/base44';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ClipboardCheck, Calendar, Users } from 'lucide-react';

export default function ParentDashboard() {
  const { user, family } = useFamilyContext();
  const fid = user.family_id || family?.id;
  
  // שליפת משימות פתוחות - עם שדות מינימליים
  const tasksQ = useQuery({ 
    queryKey: ['tasks', fid, { status:'open', limit:10 }], 
    queryFn: () => entities.list('Task', { 
      family_id: fid, 
      status: 'open', 
      limit: 10, 
      fields: ['id','title','due_date','child_id'] 
    }),
    enabled: !!fid
  });

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* כותרת פשוטה */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">דשבורד הורה</h1>
        <p className="text-gray-600">ברוך הבא, {user?.full_name || user?.email}</p>
        {family && <p className="text-sm text-gray-500">משפחת {family.name}</p>}
      </div>

      {/* כרטיסי סטטיסטיקה בסיסיים */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משפחה</CardTitle>
            <Home className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{family?.name || 'טוען...'}</div>
            <p className="text-xs text-muted-foreground">משפחתך</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">משימות פתוחות</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tasksQ.data?.length || 0}</div>
            <p className="text-xs text-muted-foreground">דורשות טיפול</p>
          </CardContent>
        </Card>
      </div>

      {/* רשימת משימות פתוחות */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            משימות פתוחות
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tasksQ.isLoading ? (
            <p className="text-gray-500">טוען משימות...</p>
          ) : (tasksQ.data?.length || 0) > 0 ? (
            <ul className="space-y-2">
              {tasksQ.data.map((t) => (
                <li key={t.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                  <span className="font-medium">{t.title}</span>
                  <span className="text-sm text-gray-500">{t.due_date || 'ללא תאריך'}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">אין משימות פתוחות כרגע</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}