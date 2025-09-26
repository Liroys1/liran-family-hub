import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  ClipboardCheck, 
  Clock, 
  Star, 
  Loader2, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import { he } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useFamilyContext } from '@/components/context/FamilyContext';
import FamilySummaryCards from '@/components/dashboard/FamilySummaryCards';
import UpcomingEvents from '@/components/shared/UpcomingEvents';
import WeeklyCustodyView from '@/components/shared/WeeklyCustodyView';

export default function ParentDashboardContent() {
    const { user, family, member } = useFamilyContext();
    
    if (!member || !family || !user) {
        return (
            <div className="flex items-center justify-center min-h-[calc(100vh-100px)]" dir="rtl">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-slate-600">טוען את הדשבורד שלך...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8 space-y-8" dir="rtl">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                    שלום {member.hebrew_name || user.full_name}
                </h1>
                <p className="text-slate-600">
                    {format(new Date(), 'EEEE, d MMMM yyyy', { locale: he })}
                </p>
            </div>

            <FamilySummaryCards />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-blue-500" />
                                אירועים קרובים
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UpcomingEvents limit={4} />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-green-500" />
                                משימות למעקב
                            </CardTitle>
                            <Link to={createPageUrl("ManageTasks")}>
                                <Button variant="outline" size="sm">
                                    ניהול משימות
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center p-6 text-slate-500">
                                <ClipboardCheck className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>רכיב משימות יטען כאן</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <WeeklyCustodyView />

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-500" />
                                המשפחה
                            </CardTitle>
                            <Link to={createPageUrl("Children")}>
                                <Button variant="outline" size="sm">
                                    צפייה בפרטים
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center p-6 text-slate-500">
                                <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                <p>פרטי בני המשפחה יטענו כאן</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Link to={createPageUrl("Calendar")} className="block">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">לוח שנה</h3>
                            <p className="text-slate-600 text-sm">צפייה באירועים וחגים</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link to={createPageUrl("ManageSchedule")} className="block">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Clock className="w-12 h-12 text-green-500 mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">מערכת שעות</h3>
                            <p className="text-slate-600 text-sm">ניהול לוחות הזמנים</p>
                        </CardContent>
                    </Card>
                </Link>

                <Link to={createPageUrl("Settings")} className="block">
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                        <CardContent className="p-6 text-center">
                            <Users className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                            <h3 className="font-semibold text-lg mb-2">הגדרות</h3>
                            <p className="text-slate-600 text-sm">ניהול המשפחה והמערכת</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>
        </div>
    );
}