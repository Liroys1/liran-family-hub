
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Schedule, Child, Subject, AuditLog, Teacher, TeacherAssignment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, Users } from 'lucide-react';
import { PERIODS, DAY_NAMES_HE, ACTIVE_WEEKDAYS_KEYS } from '@/components/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFamilyContext } from '@/context/FamilyContext';
import { useChildrenWithMembers } from '@/components/hooks/useChildren';
import { useSchedulesData, useMutateSchedule } from '@/components/hooks/useSchedules';


const ScheduleCell = ({ day, period, schedule, subjects, teachers, assignments, selectedChildId, onSave, onDelete, isReadOnly }) => {
    const [isEditing, setIsEditing] = useState(false);

    const getSubjectInfo = useCallback((subjectId) => {
        if (!subjectId || !subjects) return { name: '', color: '#F3F4F6', location: '' }; // Added location
        const subject = subjects.find(s => s && s.id === subjectId);
        return {
            name: subject ? subject.hebrew_name : 'לא ידוע',
            color: subject ? subject.color : '#F3F4F6',
            location: subject ? subject.location : '', // Get location from subject
        };
    }, [subjects]);

    const getTeacherName = useCallback((scheduleItem) => {
        if (!scheduleItem || !assignments || !teachers) return null;
        
        const assignment = assignments.find(a => 
            a.is_active &&
            a.child_id === scheduleItem.child_id &&
            a.subject_ids && a.subject_ids.includes(scheduleItem.subject)
        );

        if (!assignment) return null;

        const teacher = teachers.find(t => t && t.id === assignment.teacher_id && t.is_active);
        return teacher ? teacher.name : null;
    }, [assignments, teachers]);


    const handleSubjectChange = async (newSubjectId) => {
        setIsEditing(false);
        // Ensure newSubjectId is handled correctly, empty string or null means removal
        const subjectIdToUse = newSubjectId === '' ? null : newSubjectId; 

        const data = {
            day_of_week: day, period_number: period.number, subject: subjectIdToUse,
            start_time: period.start_time, end_time: period.end_time, child_id: selectedChildId,
        };

        try {
            if (schedule?.id) {
                if (subjectIdToUse) await onSave({ ...schedule, subject: subjectIdToUse });
                else await onDelete(schedule);
            } else if (subjectIdToUse) {
                await onSave(data);
            }
        } catch (error) {
            console.error("Failed to update schedule", error);
            alert("שגיאה בעדכון מערכת השעות.");
        }
    };

    const sortedSubjects = useMemo(() =>
        (subjects || []).filter(s => s && s.is_active && s.hebrew_name)
        .sort((a, b) => a.hebrew_name.localeCompare(b.hebrew_name, 'he')),
    [subjects]);

    const currentSubjectInfo = getSubjectInfo(schedule?.subject);
    const teacherName = getTeacherName(schedule);

    if (isEditing) {
        return (
             <div className="relative h-full min-h-[60px]">
                <Select defaultValue={schedule?.subject || ''} onValueChange={handleSubjectChange} onOpenChange={(isOpen) => !isOpen && setIsEditing(false)} defaultOpen={true}>
                    <SelectTrigger className="opacity-0 w-full h-full absolute inset-0 z-10 cursor-pointer"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value={null}>-- הסר שיעור --</SelectItem> {/* Use empty string for removal */}
                        {sortedSubjects.map(subject => <SelectItem key={subject.id} value={subject.id}>{subject.hebrew_name}</SelectItem>)}
                    </SelectContent>
                </Select>
                <div className="p-2 border rounded-md h-full w-full flex flex-col justify-center items-center text-center ring-2 ring-blue-500" style={{ backgroundColor: currentSubjectInfo.color + '40' }}>
                    <p className="font-semibold text-sm">{currentSubjectInfo.name || 'בחירה...'}</p>
                    {currentSubjectInfo.location && <p className="text-xs text-slate-500 mt-1">{currentSubjectInfo.location}</p>} {/* Display location */}
                </div>
            </div>
        );
    }
    
    return (
        <div className="p-2 border rounded-md h-full min-h-[60px] flex flex-col justify-center items-center text-center transition-all" onClick={() => !isReadOnly && setIsEditing(true)} style={{ backgroundColor: schedule ? currentSubjectInfo.color + '20' : 'transparent', cursor: isReadOnly ? 'default' : 'pointer' }}>
            {schedule ? (
              <div>
                <p className="font-semibold text-sm text-slate-800">{currentSubjectInfo.name}</p>
                {teacherName && <p className="text-xs text-slate-500 mt-1">{teacherName}</p>}
                {currentSubjectInfo.location && <p className="text-xs text-slate-500 mt-1">{currentSubjectInfo.location}</p>} {/* Display location */}
              </div>
            ) : (!isReadOnly && <Plus className="w-4 h-4 text-slate-400" />)}
        </div>
    );
};

const MobileScheduleView = ({ scheduleGrid, subjects, teachers, assignments, selectedChildId, onSave, onDelete, isReadOnly }) => (
    <Tabs defaultValue={ACTIVE_WEEKDAYS_KEYS[0]} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
            {ACTIVE_WEEKDAYS_KEYS.map(day => (
                <TabsTrigger key={day} value={day}>{DAY_NAMES_HE[day]}</TabsTrigger>
            ))}
        </TabsList>
        {ACTIVE_WEEKDAYS_KEYS.map(day => (
            <TabsContent key={day} value={day} className="mt-4 space-y-2">
                {PERIODS.map(period => {
                    const schedule = scheduleGrid[day]?.[period.number] || null;
                    return (
                        <div key={period.number} className="flex items-center gap-4 p-2 border rounded-lg">
                            <div className="flex flex-col items-center justify-center w-20 text-center shrink-0">
                                <div className="font-bold text-lg">{period.number}</div>
                                <div className="text-xs text-slate-500">({period.start_time}-{period.end_time})</div>
                            </div>
                            <div className="flex-1">
                                <ScheduleCell
                                    day={day} period={period}
                                    schedule={schedule}
                                    subjects={subjects} 
                                    teachers={teachers}
                                    assignments={assignments}
                                    selectedChildId={selectedChildId}
                                    onSave={onSave} onDelete={onDelete} isReadOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    );
                })}
            </TabsContent>
        ))}
    </Tabs>
);

export default function ManageSchedulePage() {
    const { user, family } = useFamilyContext();
    const { data: children, isLoading: isLoadingChildren } = useChildrenWithMembers(family?.id);
    const { data: schedulesData, isLoading: isLoadingSchedules } = useSchedulesData(family?.id);
    const { createMutation, updateMutation, deleteMutation } = useMutateSchedule(family?.id);
    
    const [selectedChild, setSelectedChild] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    
    const subjects = schedulesData?.subjects;
    const teachers = schedulesData?.teachers;
    const assignments = schedulesData?.assignments;

    const isReadOnly = user?.family_role !== 'parent';
    
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // Set initial value
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);
    
    useEffect(() => {
        if (!selectedChild && children && children.length > 0) {
            setSelectedChild(children[0]);
        }
    }, [children, selectedChild]);

    const scheduleGrid = useMemo(() => {
        if (!selectedChild || !schedulesData?.schedules) return {};
        const grid = {};
        schedulesData.schedules.filter(s => s.child_id === selectedChild.id).forEach(s => {
            if (!grid[s.day_of_week]) grid[s.day_of_week] = {};
            grid[s.day_of_week][s.period_number] = s;
        });
        return grid;
    }, [schedulesData?.schedules, selectedChild]);

    const handleSaveSchedule = async (scheduleData) => {
        const action = scheduleData.id ? 'update' : 'create';
        const mutation = action === 'update' ? updateMutation : createMutation;
        const saved = await mutation.mutateAsync(scheduleData);
        if(user?.family_role === 'parent' && saved && family?.id) {
            await AuditLog.create({ family_id: family.id, entity_type: 'Schedule', entity_id: saved.id, action, details: `עדכון מערכת שעות עבור ${selectedChild.hebrew_name}`, user_name: user.hebrew_name });
        }
    };

    const handleDeleteSchedule = async (scheduleData) => {
        await deleteMutation.mutateAsync(scheduleData.id);
        if(user?.family_role === 'parent' && family?.id) {
            await AuditLog.create({ family_id: family.id, entity_type: 'Schedule', entity_id: scheduleData.id, action: 'delete', details: `מחיקת שיעור עבור ${selectedChild.hebrew_name}`, user_name: user.hebrew_name });
        }
    };

    if (isLoadingChildren || isLoadingSchedules) return <div className="p-8 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-blue-500" /></div>;

    return (
        <div className="p-4 md:p-8" dir="rtl">
            <Card>
                <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <CardTitle className="text-2xl">ניהול מערכת שעות</CardTitle>
                        <div className="flex items-center gap-2">
                           <Users className="w-5 h-5 text-slate-500"/>
                           <Select onValueChange={(childId) => setSelectedChild(children.find(c => c.id === childId))} value={selectedChild?.id}>
                                <SelectTrigger className="w-[180px]"><SelectValue placeholder="בחר ילד" /></SelectTrigger>
                                <SelectContent>
                                    {children && children.map(child => <SelectItem key={child.id} value={child.id}>{child.hebrew_name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                    {selectedChild ? (
                        isMobile ? (
                           <MobileScheduleView 
                             scheduleGrid={scheduleGrid}
                             subjects={subjects}
                             teachers={teachers}
                             assignments={assignments}
                             selectedChildId={selectedChild.id}
                             onSave={handleSaveSchedule}
                             onDelete={handleDeleteSchedule}
                             isReadOnly={isReadOnly}
                           />
                        ) : (
                        <div className="grid grid-cols-[auto_repeat(6,1fr)] gap-1 min-w-[800px]" style={{ direction: 'rtl' }}>
                            <div className="font-semibold p-2 text-center sticky right-0 bg-slate-50">שעה</div>
                            {ACTIVE_WEEKDAYS_KEYS.map(dayKey => <div key={dayKey} className="font-semibold p-2 text-center">{DAY_NAMES_HE[dayKey]}</div>)}
                            
                            {PERIODS.map(period => (
                                <React.Fragment key={period.number}>
                                    <div className="font-semibold p-2 text-center flex flex-col items-center justify-center border-t sticky right-0 bg-white">
                                        <div className="text-sm font-bold">{period.number}.</div>
                                        <div className="text-xs text-slate-500 mt-1">({period.start_time}-{period.end_time})</div>
                                    </div>
                                    {ACTIVE_WEEKDAYS_KEYS.map(day => (
                                        <div key={`${day}-${period.number}`} className="border-t p-1">
                                            <ScheduleCell
                                                day={day} period={period}
                                                schedule={scheduleGrid[day]?.[period.number] || null}
                                                subjects={subjects} 
                                                teachers={teachers}
                                                assignments={assignments}
                                                selectedChildId={selectedChild.id}
                                                onSave={handleSaveSchedule} onDelete={handleDeleteSchedule} isReadOnly={isReadOnly} />
                                        </div>
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                        )
                    ) : <p className="text-center text-slate-500 py-8">יש לבחור ילד כדי להציג את מערכת השעות.</p>}
                </CardContent>
            </Card>
        </div>
    );
}
