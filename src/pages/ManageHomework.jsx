
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Homework, Child, AuditLog, Subject } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Plus, Edit, Trash2, BookOpen, Clock } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { he } from 'date-fns/locale';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const HomeworkForm = ({ homework, children, subjects, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        child_id: '',
        subject_id: '', // Changed from 'subject' to 'subject_id'
        due_date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        status: 'pending',
    });

    useEffect(() => {
        if (homework) {
            setFormData({
                title: homework.title || '',
                description: homework.description || '',
                child_id: homework.child_id || '',
                subject_id: homework.subject_id || '', // Changed from 'subject' to 'subject_id'
                due_date: homework.due_date ? format(new Date(homework.due_date), 'yyyy-MM-dd') : new Date().toISOString().split('T')[0],
                priority: homework.priority || 'medium',
                status: homework.status || 'pending',
            });
        } else {
            setFormData({
                title: '',
                description: '',
                child_id: '',
                subject_id: '', // Changed from 'subject' to 'subject_id'
                due_date: new Date().toISOString().split('T')[0],
                priority: 'medium',
                status: 'pending',
            });
        }
    }, [homework]);

    const handleChange = (field, value) => setFormData(prev => ({...prev, [field]: value}));

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>כותרת</Label>
                <Input 
                    value={formData.title} 
                    onChange={e => handleChange('title', e.target.value)} 
                    placeholder="שם המשימה"
                    required
                />
            </div>
            <div className="space-y-2">
                <Label>תיאור</Label>
                <Textarea 
                    value={formData.description} 
                    onChange={e => handleChange('description', e.target.value)} 
                    placeholder="תיאור המשימה"
                    className="min-h-[100px]"
                    required
                />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>ילד/ה</Label>
                    <Select value={formData.child_id} onValueChange={value => handleChange('child_id', value)} required>
                        <SelectTrigger><SelectValue placeholder="בחירת ילד"/></SelectTrigger>
                        <SelectContent>
                            {children.map(c => <SelectItem key={c.id} value={c.id}>{c.hebrew_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>מקצוע</Label>
                     {/* Changed from Input to Select for subject */}
                     <Select value={formData.subject_id} onValueChange={value => handleChange('subject_id', value)} required>
                        <SelectTrigger><SelectValue placeholder="בחירת מקצוע"/></SelectTrigger>
                        <SelectContent>
                            {(subjects || []).map(s => <SelectItem key={s.id} value={s.id}>{s.hebrew_name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>תאריך הגשה</Label>
                    <Input 
                        type="date" 
                        value={formData.due_date} 
                        onChange={e => handleChange('due_date', e.target.value)} 
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label>עדיפות</Label>
                    <Select value={formData.priority} onValueChange={value => handleChange('priority', value)}>
                        <SelectTrigger><SelectValue/></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="low">נמוכה</SelectItem>
                            <SelectItem value="medium">בינונית</SelectItem>
                            <SelectItem value="high">גבוהה</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
             </div>
             <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>ביטול</Button>
                <Button type="submit">שמור משימה</Button>
            </DialogFooter>
        </form>
    );
};

export default function ManageHomeworkPage({ user, allData, refreshData, isLoading: isLayoutLoading }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingHomework, setEditingHomework] = useState(null);

    // Destructure 'subjects' from allData
    const { homework, children, subjects } = allData;

    const handleSaveHomework = async (data) => {
        const action = editingHomework ? 'update' : 'create';
        try {
            let savedHomework;
            if (editingHomework) {
                savedHomework = await Homework.update(editingHomework.id, data);
            } else {
                savedHomework = await Homework.create(data);
            }
            
            await AuditLog.create({
                entity_type: 'Homework',
                entity_id: savedHomework?.id || 'new',
                action: action,
                details: `${action === 'create' ? 'יצירת' : 'עדכון'} שיעורי בית: ${data.title}`,
                user_name: user?.hebrew_name || 'לא ידוע'
            });
            
            setIsFormOpen(false);
            setEditingHomework(null);
            await refreshData();
        } catch (error) {
            console.error("Failed to save homework:", error);
            alert("שגיאה בשמירת המשימה.");
        }
    };
    
    const handleDeleteHomework = async (homeworkToDelete) => {
        if (window.confirm(`האם למחוק את המשימה "${homeworkToDelete.title}"?`)) {
            try {
                await Homework.delete(homeworkToDelete.id);
                await AuditLog.create({
                    entity_type: 'Homework',
                    entity_id: homeworkToDelete.id,
                    action: 'delete',
                    details: `מחיקת שיעורי בית: ${homeworkToDelete.title}`,
                    user_name: user?.hebrew_name || 'לא ידוע'
                });
                await refreshData();
            } catch (error) {
                console.error("Failed to delete homework:", error);
                alert("שגיאה במחיקת המשימה.");
            }
        }
    };

    const handleEdit = (hw) => {
        setEditingHomework(hw);
        setIsFormOpen(true);
    };

    if (isLayoutLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    const sortedHomework = [...(homework || [])].sort((a,b) => new Date(b.created_date) - new Date(a.created_date));

    return (
        <div className="p-4 md:p-8 space-y-8" dir="rtl">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">ניהול שיעורי בית</h1>
                <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => { setEditingHomework(null); setIsFormOpen(true); }}>
                            <Plus className="w-4 h-4 ml-2" /> הוסף משימה
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingHomework ? 'עריכת שיעורי בית' : 'הוספת שיעורי בית'}</DialogTitle>
                        </DialogHeader>
                        <HomeworkForm
                            homework={editingHomework}
                            children={children || []}
                            subjects={subjects || []} // Pass subjects to HomeworkForm
                            onSave={handleSaveHomework}
                            onCancel={() => setIsFormOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            </div>

            <div className="space-y-4">
                {sortedHomework.length > 0 ? sortedHomework.map(hw => {
                    const child = children.find(c => c.id === hw.child_id);
                    const subject = subjects.find(s => s.id === hw.subject_id); // Find subject by subject_id
                    const isOverdue = isPast(new Date(hw.due_date)) && !isToday(new Date(hw.due_date)) && hw.status !== 'completed';
                    return (
                        <Card key={hw.id} className={`${isOverdue ? 'border-red-400' : ''} overflow-hidden`}>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                {child && (
                                                    <img 
                                                        src={child.image_url} 
                                                        alt={child.hebrew_name}
                                                        className="w-8 h-8 rounded-full object-cover" 
                                                    />
                                                )}
                                                {/* Display subject hebrew_name */}
                                                <Badge variant="outline" className="text-xs">{subject ? subject.hebrew_name : 'לא ידוע'}</Badge>
                                            </div>
                                            <h3 className="font-bold text-lg leading-tight break-words">
                                                {hw.title}
                                            </h3>
                                            <p className="text-slate-600 text-sm mt-2 break-words">
                                                {hw.description}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(hw)} className="h-8 w-8">
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteHomework(hw)} className="h-8 w-8">
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between pt-2 border-t">
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Clock className="w-4 h-4" />
                                            <span>{format(new Date(hw.due_date), 'dd/MM/yyyy')}</span>
                                            {isOverdue && <Badge variant="destructive" className="text-xs">איחור</Badge>}
                                        </div>
                                        <Badge variant={hw.status === 'completed' ? 'default' : 'secondary'} className={hw.status === 'completed' ? 'bg-green-100 text-green-800' : ''}>
                                            {hw.status === 'completed' ? 'הושלם' : hw.status === 'in_progress' ? 'בתהליך' : 'ממתין'}
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                }) : (
                    <Card className="text-center p-8">
                        <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">לא הוגדרו עדיין שיעורי בית</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
