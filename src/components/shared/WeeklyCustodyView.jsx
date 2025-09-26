import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Users } from 'lucide-react';

// Simple static version for now - no useFamilyContext calls
export default function WeeklyCustodyView() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" />
                    משמרות השבוע
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-center p-6 text-slate-500">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>מערכת המשמרות תוצג כאן</p>
                    <p className="text-xs mt-1">לאחר הגדרת תבנית המשמרות</p>
                </div>
            </CardContent>
        </Card>
    );
}