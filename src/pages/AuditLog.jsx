
import React, { useState, useEffect, useCallback } from 'react';
import { AuditLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookText, User, Calendar, Edit, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { useFamilyContext } from '@/components/context/FamilyContext';

const ActionIcon = ({ action }) => {
    switch (action) {
        case 'create': return <Plus className="w-4 h-4 text-green-500" />;
        case 'update': return <Edit className="w-4 h-4 text-blue-500" />;
        case 'delete': return <Trash2 className="w-4 h-4 text-red-500" />;
        case 'deactivate': return <Trash2 className="w-4 h-4 text-red-500" />;
        default: return <BookText className="w-4 h-4" />;
    }
};

export default function AuditLogPage() {
    const { family } = useFamilyContext();
    const [logs, setLogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadLogs = useCallback(async () => {
        if (!family?.id) {
            // If family ID is not available, we don't proceed with loading logs.
            // We might want to set isLoading to false here if there's no ID expected,
            // but for now, it will remain true until family?.id is available and it actually fetches.
            // Or, if no ID means no logs, we can set logs to empty and isLoading to false.
            // For this specific case, it's better to just return and wait for family.id.
            return; 
        }
        setIsLoading(true);
        try {
            // Filter logs by family_id for security and relevance
            const data = await AuditLog.filter({ family_id: family.id }, '-created_date', 100);
            setLogs(data);
        } catch (error) {
            console.error("Error loading audit logs:", error);
            setLogs([]); // Clear logs on error
        } finally {
            setIsLoading(false);
        }
    }, [family?.id]); // `loadLogs` depends on `family?.id`

    useEffect(() => {
        // Call loadLogs whenever it changes (which happens when family?.id changes)
        loadLogs();
    }, [loadLogs]); // `useEffect` now depends on `loadLogs`

    if (isLoading) {
        return (
            <div className="p-8 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-8" dir="rtl">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">יומן שינויים</h1>
            
            <Card className="border-none shadow-lg">
                <CardContent className="p-0">
                    <div className="space-y-4">
                        {logs.length > 0 ? (
                            logs.map(log => (
                                <div key={log.id} className="flex items-center gap-4 p-4 border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                                    <div className="p-2 bg-slate-100 rounded-full">
                                        <ActionIcon action={log.action} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-slate-800">{log.details}</p>
                                        <div className="text-sm text-slate-500 flex items-center gap-4 mt-1">
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> {log.user_name}</span>
                                            <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {format(new Date(log.created_date), 'd MMMM yyyy, HH:mm', { locale: he })}</span>
                                            <Badge variant="outline" className="text-xs">{log.entity_type}</Badge>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <BookText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-500">לא נמצאו רישומי פעילות.</p>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
