
import React, { useState, useEffect, useMemo } from 'react';
import { Event, AuditLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, Palette, Book, Search, Loader2, Trash2, Home } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useEvents, useCreateEvent, useUpdateEvent, useDeleteEvent } from '@/components/hooks/useEvents';

const EventCard = ({ event, onEdit, onDelete, isReadOnly }) => {
  const isHoliday = event.type === 'holiday';
  const isVacation = event.type === 'vacation';
  
  const getEventIcon = () => {
    if (isHoliday) return <Palette className="w-5 h-5" />;
    if (isVacation) return <Book className="w-5 h-5" />;
    return <Calendar className="w-5 h-5" />;
  };
  
  const getBgColor = () => {
    if (isHoliday) return 'bg-red-50 border-red-200 hover:bg-red-100';
    if (isVacation) return 'bg-green-50 border-green-200 hover:bg-green-100';
    return 'bg-blue-50 border-blue-200 hover:bg-blue-100';
  };
  
  const getIconBg = () => {
    if (isHoliday) return 'bg-red-100';
    if (isVacation) return 'bg-green-100';
    return 'bg-blue-100';
  };

  const formatDateRange = (startDate, endDate) => {
    const start = parseISO(startDate);
    if (!endDate || endDate === startDate) {
      return format(start, 'EEEE, d MMMM yyyy', { locale: he });
    }
    const end = parseISO(endDate);
    return `${format(start, 'd MMMM', { locale: he })} - ${format(end, 'd MMMM yyyy', { locale: he })}`;
  };
  
  return (
    <Card className={`border-none shadow-md transition-all duration-200 ${getBgColor()}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className={`p-2 rounded-lg ${getIconBg()}`}>
              {getEventIcon()}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">{event.title}</h3>
              <p className="text-sm text-slate-600 mt-1">
                {formatDateRange(event.date, event.end_date)}
              </p>
              {event.description && (
                <p className="text-sm text-slate-500 mt-1">{event.description}</p>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge 
              variant={isHoliday ? "destructive" : isVacation ? "default" : "secondary"}
              className={isHoliday ? "bg-red-100 text-red-800" : isVacation ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}
            >
              {isHoliday ? 'חג' : isVacation ? 'חופשה' : 'אירוע'}
            </Badge>
            {!isReadOnly && (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onEdit(event)}>
                  <Palette className="w-4 h-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" className="w-7 h-7" onClick={() => onDelete(event)}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default function HolidaysPage() {
  const { user, family } = useFamilyContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  const { data: allEvents, isLoading: isEventsLoading } = useEvents(family?.id, { type: ['holiday', 'vacation'] });
  const createEventMutation = useCreateEvent();
  const updateEventMutation = useUpdateEvent();
  const deleteEventMutation = useDeleteEvent();
  
  const events = useMemo(() => allEvents || [], [allEvents]);
  const isReadOnly = user?.family_role !== 'parent';

  const handleOpenDialog = (event = null) => {
    setEditingEvent(event ? {...event} : { title: '', date: '', end_date: '', type: 'vacation', all_day: true, description: '' });
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!editingEvent?.title || !editingEvent?.date) return;
    
    const action = editingEvent.id ? 'update' : 'create';
    const details = action === 'update' 
        ? `עדכון אירוע: ${editingEvent.title}` 
        : `יצירת אירוע חדש: ${editingEvent.title}`;

    try {
      let savedEvent;
      if (action === 'update') {
          savedEvent = await updateEventMutation.mutateAsync({ id: editingEvent.id, ...editingEvent });
      } else {
          savedEvent = await createEventMutation.mutateAsync({ ...editingEvent, family_id: family.id });
      }
      
      if (user?.family_role === 'parent' && savedEvent) {
          await AuditLog.create({
              family_id: family.id,
              entity_type: 'Event',
              entity_id: savedEvent.id,
              action: action,
              details: details,
              user_name: user.hebrew_name,
          });
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert(`שגיאה בשמירת האירוע: ${error.message}`);
    } finally {
      setIsDialogOpen(false);
    }
  };

  const handleDelete = async (event) => {
    if (!confirm(`האם למחוק את "${event.title}"?`)) return;
    try {
      await deleteEventMutation.mutateAsync(event.id);
       if (user?.family_role === 'parent') {
          await AuditLog.create({
              family_id: family.id,
              entity_type: 'Event',
              entity_id: event.id,
              action: 'delete',
              details: `מחיקת אירוע: ${event.title}`,
              user_name: user.hebrew_name,
          });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert(`שגיאה במחיקת האירוע: ${error.message}`);
    }
  };

  const filteredEvents = useMemo(() => events.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase()))
  ), [events, searchTerm]);

  const holidays = filteredEvents.filter(e => e.type === 'holiday');
  const vacations = filteredEvents.filter(e => e.type === 'vacation');

  if (isEventsLoading || !user) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <div className="mb-4">
        <Link to={createPageUrl("Dashboard")} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <Home className="w-4 h-4"/>
          חזרה למסך הבית
        </Link>
      </div>
      
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">חגים וחופשות</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="חפש חג או חופשה..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10 w-64"
            />
          </div>
          {!isReadOnly && (
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleOpenDialog()}>
              <Plus className="w-4 h-4 ml-2" />
              הוסף אירוע
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Holidays Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Palette className="w-6 h-6 text-red-500" />
            חגים ({holidays.length})
          </h2>
          {holidays.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {holidays.map(event => (
                <EventCard key={event.id} event={event} onEdit={handleOpenDialog} onDelete={handleDelete} isReadOnly={isReadOnly} />
              ))}
            </div>
          ) : (
            <Card className="text-center p-8 border-dashed border-2 border-slate-200">
              <Palette className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">לא נמצאו חגים</p>
            </Card>
          )}
        </div>

        {/* Vacations Section */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Book className="w-6 h-6 text-green-500" />
            חופשות משרד החינוך ({vacations.length})
          </h2>
          {vacations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vacations.map(event => (
                <EventCard key={event.id} event={event} onEdit={handleOpenDialog} onDelete={handleDelete} isReadOnly={isReadOnly} />
              ))}
            </div>
          ) : (
            <Card className="text-center p-8 border-dashed border-2 border-slate-200">
              <Book className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">לא נמצאו חופשות</p>
            </Card>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-red-600 mb-2">{holidays.length}</div>
          <div className="text-slate-600">חגים השנה</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-green-600 mb-2">{vacations.length}</div>
          <div className="text-slate-600">חופשות בתי ספר</div>
        </Card>
        <Card className="text-center p-6">
          <div className="text-3xl font-bold text-blue-600 mb-2">{events.length}</div>
          <div className="text-slate-600">סה"כ אירועים</div>
        </Card>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>{editingEvent?.id ? 'עריכת אירוע' : 'הוספת אירוע חדש'}</DialogTitle>
              </DialogHeader>
              {editingEvent && (
                  <div className="space-y-4 py-4">
                      <div className="space-y-1">
                          <Label htmlFor="title">כותרת</Label>
                          <Input id="title" value={editingEvent.title} onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                              <Label htmlFor="date">תאריך התחלה</Label>
                              <Input id="date" type="date" value={editingEvent.date} onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})} />
                          </div>
                          <div className="space-y-1">
                              <Label htmlFor="end_date">תאריך סיום (אופציונלי)</Label>
                              <Input id="end_date" type="date" value={editingEvent.end_date || ''} onChange={(e) => setEditingEvent({...editingEvent, end_date: e.target.value})} />
                          </div>
                      </div>
                      <div className="space-y-1">
                          <Label>סוג</Label>
                          <div className="flex gap-4">
                              <Button 
                                variant={editingEvent.type === 'vacation' ? 'default' : 'outline'} 
                                onClick={() => setEditingEvent({...editingEvent, type: 'vacation'})}
                              >
                                חופשה
                              </Button>
                              <Button 
                                variant={editingEvent.type === 'holiday' ? 'destructive' : 'outline'} 
                                onClick={() => setEditingEvent({...editingEvent, type: 'holiday'})}
                              >
                                חג
                              </Button>
                          </div>
                      </div>
                  </div>
              )}
              <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>ביטול</Button>
                  <Button onClick={handleSave}>שמור אירוע</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </div>
  );
}
