import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationPreference } from '@/api/entities';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { queryKeys } from '@/components/constants/queryKeys';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Save } from 'lucide-react';

export default function NotificationPreferencesPage() {
    const { user, family, member } = useFamilyContext();
    const queryClient = useQueryClient();

    const { data: pref, isLoading } = useQuery({
        queryKey: queryKeys.notificationPreferences(family?.id, member?.id),
        queryFn: async () => {
            const prefs = await NotificationPreference.filter({ family_id: family.id, member_id: member.id });
            return prefs[0] || { enabled: true, quiet_hours: { start: '22:00', end: '07:00' }, channel: 'web' };
        },
        enabled: !!family?.id && !!member?.id,
    });

    const saveMutation = useMutation({
        mutationFn: (payload) =>
            pref?.id
                ? NotificationPreference.update(pref.id, payload)
                : NotificationPreference.create({ family_id: family.id, member_id: member.id, ...payload }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.notificationPreferences(family?.id, member?.id) });
        }
    });

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-2xl mx-auto" dir="rtl">
            <h1 className="text-3xl font-bold mb-8">העדפות התראה</h1>
            <Card>
                <CardHeader>
                    <CardTitle>שליטה על התראות</CardTitle>
                    <CardDescription>כאן תוכל/י להגדיר כיצד ומתי לקבל התראות מהמערכת.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                        <Label htmlFor="notifications-enabled" className="font-semibold">הפעלת התראות</Label>
                        <Switch
                            id="notifications-enabled"
                            checked={pref?.enabled}
                            onCheckedChange={(checked) => saveMutation.mutate({ enabled: checked })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="font-semibold">שעות שקט</Label>
                        <p className="text-sm text-slate-500">לא יישלחו התראות בטווח השעות שתגדיר/י.</p>
                        <div className="flex items-center gap-4 p-4 border rounded-lg">
                            <div className="flex-1 space-y-1">
                                <Label htmlFor="quiet-start">התחלה</Label>
                                <Input
                                    id="quiet-start"
                                    type="time"
                                    defaultValue={pref?.quiet_hours?.start || '22:00'}
                                    onBlur={(e) => saveMutation.mutate({ quiet_hours: { ...pref.quiet_hours, start: e.target.value } })}
                                />
                            </div>
                            <div className="flex-1 space-y-1">
                                <Label htmlFor="quiet-end">סיום</Label>
                                <Input
                                    id="quiet-end"
                                    type="time"
                                    defaultValue={pref?.quiet_hours?.end || '07:00'}
                                    onBlur={(e) => saveMutation.mutate({ quiet_hours: { ...pref.quiet_hours, end: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}