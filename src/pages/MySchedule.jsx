
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Schedule, Subject, Teacher, TeacherAssignment } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { PERIODS, DAY_NAMES_HE, ACTIVE_WEEKDAYS_KEYS } from '@/components/constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ScheduleCell = ({ schedule, subjects, teachers, assignments }) => {
    const getSubjectInfo = useCallback((subjectId) => {
        if (!subjectId || !subjects) return { name: '', color: '#F3F4F6' };
        const subject = subjects.find(s => s && s.id === subjectId);
        return {
            name: subject ? subject.hebrew_name : 'לא ידוע',
            color: subject ? subject.color : '#F3F4F6',
            location: subject ? subject.location : '',
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

    const currentSubjectInfo = getSubjectInfo(schedule?.subject);
    const teacherName = getTeacherName(schedule);

    return (
        <div className="p-2 border rounded-md h-full min-h-[60px] flex flex-col justify-center items-center text-center" style={{ backgroundColor: schedule ? currentSubjectInfo.color + '20' : 'transparent' }}>
            {schedule ? (
              <div>
                <p className="font-semibold text-sm text-slate-800">{currentSubjectInfo.name}</p>
                {teacherName && <p className="text-xs text-slate-500 mt-1">{teacherName}</p>}
                {currentSubjectInfo.location && <p className="text-xs text-slate-500 mt-1">{currentSubjectInfo.location}</p>}
              </div>
            ) : <span className="text-slate-400 text-sm">שיעור חופשי</span>}
        </div>
    );
};

export default function MySchedulePage({ user, allData, isAppLoading, refreshData }) {
    const { schedules, subjects, teachers, assignments } = allData || {};
    
    const scheduleGrid = useMemo(() => {
        if (!user || !schedules) return {};
        const grid = {};
        schedules.forEach(s => {
            if (s.child_id === user.id) {
                if (!grid[s.day_of_week]) grid[s.day_of_week] = {};
                grid[s.day_of_week][s.period_number] = s;
            }
        });
        return grid;
    }, [schedules, user]);

    if (isAppLoading || !user) {
        return (
            <div className="p-8 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    if (user?.role !== 'child') {
        return (
          <div className="p-8 text-center">
            <p className="text-red-500">עמוד זה זמין רק לילדים.</p>
          </div>
        );
    }
    
    return (
        <div className="p-4 md:p-8" dir="rtl">
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl">מערכת השעות שלי</CardTitle>
                </CardHeader>
                <CardContent>
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
                                        <div key={period.number} className="flex items-center gap-4 p-2 border rounded-lg bg-slate-50">
                                            <div className="flex flex-col items-center justify-center w-20 text-center shrink-0">
                                                <div className="font-bold text-lg">{period.number}</div>
                                                <div className="text-xs text-slate-500">({period.start_time}-{period.end_time})</div>
                                            </div>
                                            <div className="flex-1">
                                                <ScheduleCell
                                                    schedule={schedule}
                                                    subjects={subjects || []} 
                                                    teachers={teachers || []}
                                                    assignments={assignments || []}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                            </TabsContent>
                        ))}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
