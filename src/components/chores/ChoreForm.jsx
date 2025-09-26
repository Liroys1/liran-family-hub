import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const DAYS_MAP = { sunday: 'ראשון', monday: 'שני', tuesday: 'שלישי', wednesday: 'רביעי', thursday: 'חמישי', friday: 'שישי', saturday: 'שבת' };

export default function ChoreForm({ chore, childrenList, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        title: '',
        category: 'בית',
        assigned_child_ids: [],
        points: 0,
        is_recurring: false,
        recurring_days: [],
        due_date: new Date().toISOString().split('T')[0],
        is_active: true,
    });

    useEffect(() => {
        if (chore) {
            setFormData({
                title: chore.title || '',
                category: chore.category || 'בית',
                assigned_child_ids: chore.assigned_child_ids || [],
                points: chore.points || 0,
                is_recurring: chore.is_recurring || false,
                recurring_days: chore.recurring_days || [],
                due_date: chore.due_date || new Date().toISOString().split('T')[0],
                is_active: chore.is_active !== false,
            });
        } else {
            // Reset form for new chore
            setFormData({
                title: '',
                category: 'בית',
                assigned_child_ids: [],
                points: 0,
                is_recurring: false,
                recurring_days: [],
                due_date: new Date().toISOString().split('T')[0],
                is_active: true,
            });
        }
    }, [chore]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleChildSelection = (childId) => {
        const currentIds = formData.assigned_child_ids;
        if (currentIds.includes(childId)) {
            handleChange('assigned_child_ids', currentIds.filter(id => id !== childId));
        } else {
            handleChange('assigned_child_ids', [...currentIds, childId]);
        }
    };
    
    const handleDaySelection = (day) => {
        const currentDays = formData.recurring_days;
        if (currentDays.includes(day)) {
            handleChange('recurring_days', currentDays.filter(d => d !== day));
        } else {
            handleChange('recurring_days', [...currentDays, day]);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            alert('יש להזין שם למשימה');
            return;
        }
        if (formData.assigned_child_ids.length === 0) {
            alert('יש לבחור לפחות ילד אחד');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>שם המשימה *</Label>
                    <Input 
                        value={formData.title} 
                        onChange={e => handleChange('title', e.target.value)} 
                        placeholder="לדוגמה: לסדר את החדר"
                        required 
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>קטגוריה</Label>
                        <Select value={formData.category} onValueChange={value => handleChange('category', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="בית">בית</SelectItem>
                                <SelectItem value="לימודים">לימודים</SelectItem>
                                <SelectItem value="אישי">אישי</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>נקודות</Label>
                        <Input 
                            type="number" 
                            min="0"
                            max="100"
                            value={formData.points} 
                            onChange={e => handleChange('points', parseInt(e.target.value, 10) || 0)} 
                            placeholder="0"
                        />
                    </div>
                </div>
                
                <div className="space-y-3">
                    <Label>משויך לילדים *</Label>
                    <div className="grid grid-cols-1 gap-3">
                        {(childrenList || []).map(child => (
                            <div key={child.id} className="flex items-center gap-3 p-2 border rounded-lg">
                                <Checkbox 
                                    id={`child-${child.id}`} 
                                    checked={formData.assigned_child_ids.includes(child.id)} 
                                    onCheckedChange={() => handleChildSelection(child.id)} 
                                />
                                <Avatar className="w-8 h-8">
                                    <AvatarImage src={child.image_url} />
                                    <AvatarFallback style={{backgroundColor: child.color, color: 'white'}}>
                                        {child.hebrew_name?.[0] || '?'}
                                    </AvatarFallback>
                                </Avatar>
                                <Label htmlFor={`child-${child.id}`} className="cursor-pointer flex-1">
                                    {child.hebrew_name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>משימה חוזרת</Label>
                    <Switch 
                        checked={formData.is_recurring} 
                        onCheckedChange={value => handleChange('is_recurring', value)} 
                    />
                </div>
                
                {formData.is_recurring ? (
                    <div className="space-y-3">
                        <Label>בחר ימים</Label>
                        <div className="grid grid-cols-2 gap-2">
                            {DAYS_OF_WEEK.map(day => (
                                <div key={day} className="flex items-center gap-2 p-2 border rounded">
                                    <Checkbox 
                                        id={`day-${day}`} 
                                        checked={formData.recurring_days.includes(day)} 
                                        onCheckedChange={() => handleDaySelection(day)} 
                                    />
                                    <Label htmlFor={`day-${day}`} className="cursor-pointer text-sm">
                                        {DAYS_MAP[day]}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <Label>תאריך יעד</Label>
                        <Input 
                            type="date" 
                            value={formData.due_date} 
                            onChange={e => handleChange('due_date', e.target.value)} 
                        />
                    </div>
                )}
                
                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>משימה פעילה</Label>
                    <Switch 
                        checked={formData.is_active} 
                        onCheckedChange={value => handleChange('is_active', value)} 
                    />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        ביטול
                    </Button>
                    <Button type="submit">
                        {chore ? 'עדכן משימה' : 'צור משימה'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
