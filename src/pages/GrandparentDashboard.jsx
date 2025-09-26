/**
 * GrandparentDashboard.jsx - דשבורד עבור סבא/סבתא (read-only)
 * תצוגה פשוטה של לוח זמנים ואירועים
 */
import React from 'react';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Calendar, Clock } from 'lucide-react';

export default function GrandparentDashboard() {
  const { user, family } = useFamilyContext();

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* כותרת חמה לסבא/סבתא */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">שלום {user?.full_name}!</h1>
        <p className="text-gray-600">ברוך הבא למשפחת {family?.name}</p>
        <p className="text-sm text-gray-500">כאן תוכל לראות את פעילות המשפחה</p>
      </div>

      {/* כרטיסי מידע כלליים */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">המשפחה</CardTitle>
            <Heart className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{family?.name}</div>
            <p className="text-xs text-muted-foreground">המשפחה שלנו</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">התפקיד שלך</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">👴👵</div>
            <p className="text-xs text-muted-foreground">סבא/סבתא יקרים</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">מצב</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">✨</div>
            <p className="text-xs text-muted-foreground">מעקב בלבד</p>
          </CardContent>
        </Card>
      </div>

      {/* תצוגת מידע כללי */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            לוח זמנים ואירועים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">תצוגת לוח זמנים ואירועים משפחתיים</p>
            <p className="text-sm text-gray-400">(read-only - מידע בלבד, ללא אפשרות עריכה)</p>
            <p className="text-sm text-blue-600 mt-3">בקרוב - יוצג כאן המידע העדכני על פעילות המשפחה</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}