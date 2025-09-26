
import React, { useState, useEffect, useCallback } from 'react';
import { AfterSchoolOverride, Child, AuditLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Trash2, CalendarHeart } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';

export default function AfterSchoolOverridesPage({ user, coreChildren, allData, isAppLoading, refreshData }) {
    // Removed local 'overrides' state, directly using allData.afterSchoolOverrides
    // Removed local 'children' state, directly using a filtered version of coreChildren
    const [newOverride, setNewOverride] = useState({ date: '', child_id: '', has_after_school: false, end_time: '16:45' });
    
    const { afterSchoolOverrides } = allData || {}; // Using destructuring for convenience

    const isReadOnly = user?.role !== 'parent';

    // Filter children directly from props, as per the original requirement for 'שירה'
    const filteredChildren = (coreChildren || []).filter(c => c.hebrew_name === 'שירה');

    // The useEffect hook for setting local 'overrides' and 'children' state is no longer needed
    // because we are now directly consuming the 'afterSchoolOverrides' and 'coreChildren' props.
    // The component will automatically re-render when these props change from the layout.
    
    const handleAddOverride = async () => {
        if (!newOverride.date || !newOverride.child_id) {
            alert("יש לבחור תאריך וילד.");
            return;
        }
        
        try {
            const created = await AfterSchoolOverride.create(newOverride);
            if(user?.role === 'parent') {
                await AuditLog.create({
                    entity_type: 'AfterSchoolOverride',
                    entity_id: created.id,
                    action: 'create',
                    details: `יצירת חריגת צהרון עבור ${filteredChildren.find(c=>c.id === newOverride.child_id)?.hebrew_name} בתאריך ${newOverride.date}`,
                    user_name: user.hebrew_name
                });
            }
            setNewOverride({ date: '', child_id: '', has_after_school: false, end_time: '16:45' });
            // Call refreshData to ensure the parent component fetches updated data,
            // which will then be passed down as props to this component.
            await refreshData();
        } catch (error) {
            console.error("Error adding override:", error);
        }
    };

    const handleDeleteOverride = async (overrideId) => {
        if (!confirm("האם למחוק את החריגה?")) return;
        try {
            // Find the override from the prop data before deleting
            const overrideToDelete = (afterSchoolOverrides || []).find(o => o.id === overrideId);
            await AfterSchoolOverride.delete(overrideId);
            if(user?.role === 'parent') {
                await AuditLog.create({
                    entity_type: 'AfterSchoolOverride',
                    entity_id: overrideId,
                    action: 'delete',
                    details: `מחיקת חריגת צהרון מתאריך ${overrideToDelete?.date ? format(parseISO(overrideToDelete.date), 'dd/MM/yyyy', {locale: he}) : 'לא ידוע'}`,
                    user_name: user.hebrew_name
                });
            }
            // Call refreshData to ensure the parent component fetches updated data,
            // which will then be passed down as props to this component.
            await refreshData();
        } catch (error) {
            console.error("Error deleting override:", error);
        }
    };
    
    if (isAppLoading) {
        return <div className="p-8 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    return (
        <div className="p-4 md:p-8" dir="rtl">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <CalendarHeart className="w-6 h-6 text-pink-500" />
                        חריגות צהרון (שירה)
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {!isReadOnly && (
                        <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
                            <h3 className="font-bold text-lg">הוספת חריגה חדשה</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                <div className="space-y-1">
                                    <Label>ילדה</Label>
                                    <Select value={newOverride.child_id} onValueChange={(val) => setNewOverride({...newOverride, child_id: val})}>
                                        <SelectTrigger><SelectValue placeholder="בחרי ילדה" /></SelectTrigger>
                                        <SelectContent>
                                            {/* Using filteredChildren directly */}
                                            {filteredChildren.map(child => <SelectItem key={child.id} value={child.id}>{child.hebrew_name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1">
                                    <Label>תאריך</Label>
                                    <Input type="date" value={newOverride.date} onChange={(e) => setNewOverride({...newOverride, date: e.target.value})} />
                                </div>
                                <div className="flex items-center space-x-2 space-x-reverse pt-6">
                                    <Switch id="has-after-school" checked={newOverride.has_after_school} onCheckedChange={(val) => setNewOverride({...newOverride, has_after_school: val})} />
                                    <Label htmlFor="has-after-school">יש צהרון?</Label>
                                </div>
                                {newOverride.has_after_school && (
                                     <div className="space-y-1">
                                        <Label>שעת סיום (אם שונה)</Label>
                                        <Input type="time" value={newOverride.end_time} onChange={(e) => setNewOverride({...newOverride, end_time: e.target.value})} />
                                    </div>
                                )}
                            </div>
                            <Button onClick={handleAddOverride}><Plus className="w-4 h-4 ml-2" /> הוסף חריגה</Button>
                        </div>
                    )}
                    
                    <div className="space-y-3">
                        {/* Using afterSchoolOverrides directly from props */}
                        {(afterSchoolOverrides || []).map(o => (
                            <div key={o.id} className="flex justify-between items-center p-3 bg-slate-100 rounded-lg">
                                <div>
                                    <p className="font-semibold">{format(parseISO(o.date), 'EEEE, d MMMM yyyy', {locale: he})}</p>
                                    <p className={`text-sm ${o.has_after_school ? 'text-green-600' : 'text-red-600'}`}>
                                        {o.has_after_school ? `יש צהרון עד ${o.end_time || '16:45'}` : 'אין צהרון'}
                                    </p>
                                </div>
                                {!isReadOnly && (
                                    <Button variant="ghost" size="icon" onClick={() => handleDeleteOverride(o.id)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
