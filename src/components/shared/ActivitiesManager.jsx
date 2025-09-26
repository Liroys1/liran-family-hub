import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Plus, Edit, Save, Trash2, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ActivityIcon from '@/components/ActivityIcon';
import { DAYS_OF_WEEK_MAP } from '@/components/constants';

export default function ActivitiesManager({ child, activities, onSave, onDelete, isReadOnly, children }) {
  const [editingActivity, setEditingActivity] = useState(null);

  const handleSave = async () => {
    if (!editingActivity.name || !editingActivity.day_of_week) {
      alert('יש למלא שם ויום עבור החוג.');
      return;
    }
    
    const activityToSave = {
      ...editingActivity,
      child_ids: editingActivity.child_ids && editingActivity.child_ids.length > 0
                 ? editingActivity.child_ids
                 : [child.id]
    };
    
    await onSave(activityToSave);
    setEditingActivity(null);
  };

  const getChildName = (childId) => children.find(c => c.id === childId)?.hebrew_name || 'לא ידוע';

  return (
    <Card>
      <CardHeader><CardTitle>חוגים - {child.hebrew_name}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {editingActivity ? (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1"><Label>שם החוג</Label><Input value={editingActivity.name} onChange={e => setEditingActivity({...editingActivity, name: e.target.value})} /></div>
              <div className="space-y-1"><Label>יום</Label>
                <Select value={editingActivity.day_of_week} onValueChange={day => setEditingActivity({...editingActivity, day_of_week: day})}>
                  <SelectTrigger><SelectValue placeholder="בחר יום"/></SelectTrigger>
                  <SelectContent>{Object.entries(DAYS_OF_WEEK_MAP).map(([key, val]) => <SelectItem key={key} value={key}>{val}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1"><Label>שעת התחלה</Label><Input type="time" value={editingActivity.start_time || ''} onChange={e => setEditingActivity({...editingActivity, start_time: e.target.value})} /></div>
              <div className="space-y-1"><Label>שעת סיום</Label><Input type="time" value={editingActivity.end_time || ''} onChange={e => setEditingActivity({...editingActivity, end_time: e.target.value})} /></div>
              <div className="col-span-1 sm:col-span-2 space-y-1"><Label>מיקום</Label><Input value={editingActivity.location || ''} onChange={e => setEditingActivity({...editingActivity, location: e.target.value})} /></div>
              <div className="col-span-1 sm:col-span-2 space-y-1">
                <Label>משתתפים בחוג</Label>
                <div className="flex gap-2 flex-wrap">
                  {children.map(c => (
                    <label key={c.id} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingActivity.child_ids?.includes(c.id) || false}
                        onChange={(e) => {
                          const currentIds = editingActivity.child_ids || [];
                          if (e.target.checked) {
                            setEditingActivity({...editingActivity, child_ids: [...currentIds, c.id]});
                          } else {
                            setEditingActivity({...editingActivity, child_ids: currentIds.filter(id => id !== c.id)});
                          }
                        }}
                        className="rounded"
                      />
                      <Avatar className="w-6 h-6">
                        <AvatarFallback style={{ backgroundColor: c.color, color: 'white', fontSize: '10px' }}>
                          {c.hebrew_name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{c.hebrew_name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}><Save className="w-4 h-4 ml-2" />שמור</Button>
              <Button variant="outline" onClick={() => setEditingActivity(null)}><X className="w-4 h-4 ml-2"/>ביטול</Button>
            </div>
          </Card>
        ) : !isReadOnly && (
          <Button onClick={() => setEditingActivity({ name: '', day_of_week: 'sunday', start_time: '16:00', end_time: '17:00', location: '', child_ids: [child.id] })}><Plus className="w-4 h-4 ml-2" />הוסף חוג</Button>
        )}
        
        <div className="space-y-3">
          {activities.length === 0 && <p className="text-sm text-slate-500">לא הוגדרו חוגים לילד זה.</p>}
          {activities.map(act => (
            <div key={act.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
              <div className="flex items-center gap-3">
                <ActivityIcon activityName={act.name} className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-bold">{act.name}</p>
                  <p className="text-sm text-slate-600">{DAYS_OF_WEEK_MAP[act.day_of_week]}, {act.start_time}-{act.end_time}</p>
                  {act.location && <p className="text-xs text-slate-500">מיקום: {act.location}</p>}
                  {act.child_ids && act.child_ids.length > 1 && (
                    <p className="text-xs text-slate-500">
                      עם: {act.child_ids.filter(id => id !== child.id).map(id => getChildName(id)).join(', ')}
                    </p>
                  )}
                </div>
              </div>
              {!isReadOnly && (
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditingActivity({...act})}><Edit className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(act)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
