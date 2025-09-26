import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Heart, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useFamilyContext } from '@/components/context/FamilyContext';
import UpcomingEvents from '@/components/shared/UpcomingEvents';

export default function GrandparentDashboardContent() {
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-500" />
                            אירועים קרובים
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <UpcomingEvents limit={5} />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="w-5 h-5 text-purple-500" />
                            המשפחה שלנו
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-center p-6">
                            <Heart className="w-12 h-12 text-pink-400 mx-auto mb-4" />
                            <p className="text-slate-600">
                                משפחת {family.name}
                            </p>
                            <p className="text-slate-500 text-sm mt-2">
                                מעודכן בכל פעילויות המשפחה
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-8 text-center">
                    <Heart className="w-16 h-16 text-pink-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">
                        ברוכים הבאים לדשבורד המשפחתי
                    </h2>
                    <p className="text-slate-600">
                        כאן תוכלו לראות את כל הפעילויות והאירועים של המשפחה
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}