import React, { useState, useEffect, useMemo } from 'react';
import { Chore, Child } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Star, Edit, Trash2, Home, BookCopy, User as UserIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import ChoreForm from '@/components/chores/ChoreForm';
import Leaderboard from '@/components/chores/Leaderboard';
import WinnerAnnouncement from '@/components/chores/WinnerAnnouncement';

const CATEGORY_ICONS = {
    'בית': <Home className="w-4 h-4" />,
    'לימודים': <BookCopy className="w-4 h-4" />,
    'אישי': <UserIcon className="w-4 h-4" />,
};

const DAYS_MAP = { sunday: 'א', monday: 'ב', tuesday: 'ג', wednesday: 'ד', thursday: 'ה', friday: 'ו', saturday: 'ש' };

export default function ManageChoresPage({ user, allData, refreshData, isLoading: isLayoutLoading }) {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingChore, setEditingChore] = useState(null);

    const { chores, completedChores, children } = allData;

    const handleSaveChore = async (choreData) => {
        try {
            if (editingChore) {
                await Chore.update(editingChore.id, choreData);
            } else {
                await Chore.create(choreData);
            }
            await refreshData();
            setIsFormOpen(false);
            setEditingChore(null);
        } catch (error) {
            console.error("Failed to save chore:", error);
            alert("שגיאה בשמירת המשימה.");
        }
    };

    const handleEdit = (chore) => {
        if (user?.role !== 'parent') return; // Security check
        setEditingChore(chore);
        setIsFormOpen(true);
    };

    const handleDelete = async (choreId) => {
        if (user?.role !== 'parent') return; // Security check
        if (!window.confirm("האם למחוק את המשימה לצמיתות?")) return;
        try {
            await Chore.delete(choreId);
            await refreshData();
        } catch (error) {
            console.error("Failed to delete chore:", error);
            alert("שגיאה במחיקת המשימה.");
        }
    };
    
    if (isLayoutLoading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    const isReadOnly = user?.role !== 'parent';

    return (
        <div className="p-4 md:p-8 space-y-8" dir="rtl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">ניהול משימות ונקודות</h1>
                {!isReadOnly && (
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={() => { setEditingChore(null); setIsFormOpen(true); }}>
                                <Plus className="w-4 h-4 ml-2" /> הוסף משימה
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
                            <DialogHeader>
                                <DialogTitle>{editingChore ? 'עריכת משימה' : 'משימה חדשה'}</DialogTitle>
                            </DialogHeader>
                            <ChoreForm
                                chore={editingChore}
                                childrenList={children || []}
                                onSave={handleSaveChore}
                                onCancel={() => {
                                    setIsFormOpen(false);
                                    setEditingChore(null);
                                }}
                            />
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <WinnerAnnouncement completedChores={completedChores} children={children} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>רשימת המשימות הפעילות</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {(chores || []).filter(c => c.is_active).length > 0 ? (
                                (chores || []).filter(c => c.is_active).map(chore => (
                                    <Card key={chore.id} className="overflow-hidden">
                                        <CardContent className="p-4">
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex-1 min-w-0 pr-2">
                                                        <h3 className="font-bold text-lg leading-tight break-words">
                                                            {chore.title}
                                                        </h3>
                                                        <div className="flex items-center gap-4 text-sm text-slate-600 mt-2">
                                                            <span className="flex items-center gap-1">
                                                                {CATEGORY_ICONS[chore.category]} 
                                                                {chore.category}
                                                            </span>
                                                            <span className="flex items-center gap-1 font-bold text-yellow-600">
                                                                <Star className="w-4 h-4" /> 
                                                                {chore.points || 0}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {!isReadOnly && (
                                                        <div className="flex items-center gap-1 ml-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(chore)} className="h-8 w-8">
                                                                <Edit className="w-4 h-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(chore.id)} className="h-8 w-8">
                                                                <Trash2 className="w-4 h-4 text-red-500" />
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center justify-between pt-2 border-t">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-500">משויך ל:</span>
                                                        <div className="flex items-center gap-1">
                                                            {(chore.assigned_child_ids || []).map(id => {
                                                                const child = children?.find(c => c.id === id);
                                                                return child ? (
                                                                    <img 
                                                                        key={id} 
                                                                        src={child.image_url} 
                                                                        alt={child.hebrew_name}
                                                                        className="w-6 h-6 rounded-full ring-2 ring-white object-cover" 
                                                                        title={child.hebrew_name} 
                                                                    />
                                                                ) : null;
                                                            })}
                                                        </div>
                                                    </div>
                                                    {chore.is_recurring && (
                                                        <div className="text-xs text-slate-500">
                                                            ימים: {chore.recurring_days?.map(d => DAYS_MAP[d]).join(', ')}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            ) : (
                                <div className="text-center p-8">
                                    <Plus className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                                    <p className="text-slate-500">לא הוגדרו עדיין משימות פעילות</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Leaderboard
                        completedChores={completedChores}
                        children={children}
                        mode="parent"
                    />
                </div>
            </div>
        </div>
    );
}