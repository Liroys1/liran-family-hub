
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Teacher, TeacherAssignment, Child, Subject, AuditLog } from '@/api/entities';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Save, Trash2, X, User, Users, Phone, Mail, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from '@/components/ui/checkbox';

const TeachersManager = ({ teachers, subjects, onSave, onDelete, isSaving }) => {
  const [editingTeacher, setEditingTeacher] = useState(null);

  const handleSave = async () => {
    if (!editingTeacher.name) {
      alert('יש למלא שם המורה'); // Keep alert as it's a client-side validation
      return;
    }
    await onSave(editingTeacher);
    setEditingTeacher(null);
  };

  const getSubjectNames = (subjectIds) => {
    if (!subjectIds || !subjects) return '';
    return subjectIds
      .map(id => subjects.find(s => s.id === id)?.hebrew_name || 'לא ידוע')
      .sort((a, b) => a.localeCompare(b, 'he'))
      .join(', ');
  };

  // Sort teachers alphabetically
  const sortedTeachers = useMemo(() => {
    return [...teachers.filter(t => t.is_active)]
      .sort((a, b) => a.name.localeCompare(b.name, 'he'));
  }, [teachers]);

  // Sort subjects alphabetically
  const sortedSubjects = useMemo(() => {
    return [...subjects.filter(s => s.is_active)]
      .sort((a, b) => a.hebrew_name.localeCompare(b.hebrew_name, 'he'));
  }, [subjects]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">ניהול מורים</h3>
        {!editingTeacher && (
          <Button onClick={() => setEditingTeacher({ name: '', subject_ids: [], phone: '', email: '', is_active: true })} disabled={isSaving}>
            <Plus className="w-4 h-4 ml-2" />
            הוסף מורה
          </Button>
        )}
      </div>

      {editingTeacher && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <Label>שם המורה</Label>
              <Input value={editingTeacher.name} onChange={e => setEditingTeacher({...editingTeacher, name: e.target.value})} disabled={isSaving} />
            </div>
            <div className="space-y-1">
              <Label>טלפון</Label>
              <Input value={editingTeacher.phone || ''} onChange={e => setEditingTeacher({...editingTeacher, phone: e.target.value})} disabled={isSaving} />
            </div>
            <div className="space-y-1">
              <Label>אימייל</Label>
              <Input value={editingTeacher.email || ''} onChange={e => setEditingTeacher({...editingTeacher, email: e.target.value})} disabled={isSaving} />
            </div>
            <div className="space-y-1">
              <Label>מקצועות שהמורה מלמדת</Label>
              <div className="flex flex-wrap gap-2 border rounded-md p-2 max-h-32 overflow-y-auto">
                {sortedSubjects.map(subject => (
                  <div key={subject.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox 
                      id={`subject-${subject.id}`} 
                      checked={editingTeacher.subject_ids?.includes(subject.id) || false}
                      onCheckedChange={(checked) => {
                        if (isSaving) return; // Prevent changes while saving
                        const currentIds = editingTeacher.subject_ids || [];
                        if (checked) {
                          setEditingTeacher({...editingTeacher, subject_ids: [...currentIds, subject.id]});
                        } else {
                          setEditingTeacher({...editingTeacher, subject_ids: currentIds.filter(id => id !== subject.id)});
                        }
                      }}
                      disabled={isSaving}
                    />
                    <Label htmlFor={`subject-${subject.id}`} className="text-sm">
                      {subject.hebrew_name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" />שומר...</> : <><Save className="w-4 h-4 ml-2" />שמור</>}
            </Button>
            <Button variant="outline" onClick={() => setEditingTeacher(null)} disabled={isSaving}>
              <X className="w-4 h-4 ml-2" />ביטול
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedTeachers.map(teacher => (
          <Card key={teacher.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{teacher.name}</p>
                  <p className="text-sm text-slate-500">מורה</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingTeacher({...teacher})} disabled={isSaving}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(teacher)} disabled={isSaving}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              {teacher.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{teacher.phone}</span>
                </div>
              )}
              {teacher.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{teacher.email}</span>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-600">מקצועות:</p>
                <p className="text-sm">{getSubjectNames(teacher.subject_ids) || 'לא הוגדרו מקצועות'}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const TeacherAssignmentsManager = ({ assignments, teachers, children, subjects, onSave, onDelete, isSaving }) => {
  const [editingAssignment, setEditingAssignment] = useState(null);

  const handleSave = async () => {
    if (!editingAssignment.teacher_id || !editingAssignment.child_id || !editingAssignment.subject_ids?.length) {
      alert('יש למלא מורה, ילד ולפחות מקצוע אחד'); // Keep alert as it's a client-side validation
      return;
    }
    await onSave(editingAssignment);
    setEditingAssignment(null);
  };

  const getTeacherName = (teacherId) => teachers.find(t => t.id === teacherId)?.name || 'לא ידוע';
  const getChildName = (childId) => children.find(c => c.id === childId)?.hebrew_name || 'לא ידוע';
  const getSubjectNames = (subjectIds) => {
    if (!subjectIds || !subjects) return '';
    return subjectIds
      .map(id => subjects.find(s => s.id === id)?.hebrew_name || 'לא ידוע')
      .sort((a, b) => a.localeCompare(b, 'he'))
      .join(', ');
  };

  // Sort teachers, children alphabetically
  const sortedTeachers = useMemo(() => {
    return [...teachers.filter(t => t.is_active)]
      .sort((a, b) => a.name.localeCompare(b.name, 'he'));
  }, [teachers]);
  
  const sortedChildren = useMemo(() => {
    return [...children]
      .sort((a, b) => a.hebrew_name.localeCompare(b.hebrew_name, 'he'));
  }, [children]);

  // Get subjects that the selected teacher teaches (sorted alphabetically)
  const getAvailableSubjectsForTeacher = useCallback((teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher || !teacher.subject_ids) return [];
    
    return teacher.subject_ids
      .map(id => subjects.find(s => s.id === id))
      .filter(Boolean)
      .sort((a, b) => a.hebrew_name.localeCompare(b.hebrew_name, 'he'));
  }, [teachers, subjects]);

  const availableSubjects = editingAssignment?.teacher_id 
    ? getAvailableSubjectsForTeacher(editingAssignment.teacher_id)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">שיוך מורים לילדים</h3>
        {!editingAssignment && (
          <Button onClick={() => setEditingAssignment({ teacher_id: '', child_id: '', subject_ids: [], is_active: true })} disabled={isSaving}>
            <Plus className="w-4 h-4 ml-2" />
            הוסף שיוך
          </Button>
        )}
      </div>

      {editingAssignment && (
        <Card className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <Label>מורה</Label>
              <Select 
                value={editingAssignment.teacher_id} 
                onValueChange={(value) => {
                  if (isSaving) return; // Prevent changes while saving
                  // Clear selected subjects when teacher changes
                  setEditingAssignment({
                    ...editingAssignment, 
                    teacher_id: value,
                    subject_ids: [] // Reset subjects when teacher changes
                  });
                }}
                disabled={isSaving}
              >
                <SelectTrigger><SelectValue placeholder="בחר מורה" /></SelectTrigger>
                <SelectContent>
                  {sortedTeachers.map(teacher => (
                    <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>ילד</Label>
              <Select 
                value={editingAssignment.child_id} 
                onValueChange={(value) => {
                  if (isSaving) return; // Prevent changes while saving
                  setEditingAssignment({...editingAssignment, child_id: value});
                }}
                disabled={isSaving}
              >
                <SelectTrigger><SelectValue placeholder="בחר ילד" /></SelectTrigger>
                <SelectContent>
                  {sortedChildren.map(child => (
                    <SelectItem key={child.id} value={child.id}>{child.hebrew_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1 sm:col-span-2 space-y-1">
              <Label>מקצועות</Label>
              {editingAssignment.teacher_id ? (
                <div className="flex flex-wrap gap-2 border rounded-md p-2 max-h-32 overflow-y-auto">
                  {availableSubjects.length > 0 ? (
                    availableSubjects.map(subject => (
                      <div key={subject.id} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id={`assign-subject-${subject.id}`} 
                          checked={editingAssignment.subject_ids?.includes(subject.id) || false}
                          onCheckedChange={(checked) => {
                            if (isSaving) return; // Prevent changes while saving
                            const currentIds = editingAssignment.subject_ids || [];
                            if (checked) {
                              setEditingAssignment({...editingAssignment, subject_ids: [...currentIds, subject.id]});
                            } else {
                              setEditingAssignment({...editingAssignment, subject_ids: currentIds.filter(id => id !== subject.id)});
                            }
                          }}
                          disabled={isSaving}
                        />
                        <Label htmlFor={`assign-subject-${subject.id}`} className="text-sm">
                          {subject.hebrew_name}
                        </Label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">המורה הנבחרת לא מלמדת מקצועות</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-slate-500 border rounded-md p-2">בחר מורה כדי לראות את המקצועות</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <><Loader2 className="w-4 h-4 ml-2 animate-spin" />שומר...</> : <><Save className="w-4 h-4 ml-2" />שמור</>}
            </Button>
            <Button variant="outline" onClick={() => setEditingAssignment(null)} disabled={isSaving}>
              <X className="w-4 h-4 ml-2" />ביטול
            </Button>
          </div>
        </Card>
      )}

      <div className="space-y-3">
        {assignments.filter(a => a.is_active).map(assignment => (
          <Card key={assignment.id} className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-100 rounded-full">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{getTeacherName(assignment.teacher_id)} ← {getChildName(assignment.child_id)}</p>
                    <p className="text-sm text-slate-500">שיוך מורה-תלמיד</p>
                  </div>
                </div>
                <div className="mr-9">
                  <p className="text-sm"><strong>מקצועות:</strong> {getSubjectNames(assignment.subject_ids)}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditingAssignment({...assignment})} disabled={isSaving}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(assignment)} disabled={isSaving}>
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {assignments.filter(a => a.is_active).length === 0 && (
          <p className="text-center text-slate-500 py-8">לא הוגדרו שיוכים</p>
        )}
      </div>
    </div>
  );
};

export default function ManageTeachersPage({ user, coreChildren, allData, isAppLoading, refreshData }) {
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('teachers');

    const { teachers, assignments, subjects } = allData || {};

    const handleSaveTeacher = async (teacher) => {
      if (!teacher.name) {
        alert('יש למלא שם המורה');
        return;
      }
      setIsSaving(true);
      try {
        const action = teacher.id ? 'update' : 'create';
        const saved = action === 'update' ? await Teacher.update(teacher.id, teacher) : await Teacher.create(teacher);
        await AuditLog.create({ entity_type: 'Teacher', entity_id: saved.id, action, details: `עדכון מורה: ${saved.name}`, user_name: user?.hebrew_name });
        await refreshData();
      } catch (err) { 
        console.error("Error saving teacher:", err);
        alert('שגיאה בשמירת המורה');
      }
      finally { setIsSaving(false); }
    };

    const handleDeleteTeacher = async (teacher) => {
      if (!confirm(`האם למחוק את המורה "${teacher.name}"?`)) return;
      setIsSaving(true);
      try {
        await Teacher.update(teacher.id, { ...teacher, is_active: false });
        await AuditLog.create({ entity_type: 'Teacher', entity_id: teacher.id, action: 'delete', details: `מחיקת מורה: ${teacher.name}`, user_name: user?.hebrew_name });
        await refreshData();
      } catch (err) { 
        console.error("Error deleting teacher:", err);
        alert('שגיאה במחיקת המורה');
      }
      finally { setIsSaving(false); }
    };

    const handleSaveAssignment = async (assignment) => {
      if (!assignment.teacher_id || !assignment.child_id || !assignment.subject_ids?.length) {
        alert('יש למלא מורה, ילד ולפחות מקצוע אחד');
        return;
      }
      setIsSaving(true);
      try {
        const action = assignment.id ? 'update' : 'create';
        const saved = action === 'update' ? await TeacherAssignment.update(assignment.id, assignment) : await TeacherAssignment.create(assignment);
        const childName = coreChildren.find(c => c.id === saved.child_id)?.hebrew_name || 'לא ידוע';
        await AuditLog.create({ entity_type: 'TeacherAssignment', entity_id: saved.id, action, details: `${action === 'create' ? 'יצירת' : 'עדכון'} שיוך מורה ל${childName}`, user_name: user?.hebrew_name });
        await refreshData();
        setActiveTab('assignments');
      } catch (err) { 
        console.error("Error saving assignment:", err);
        alert('שגיאה בשמירת השיוך');
      }
      finally { setIsSaving(false); }
    };

    const handleDeleteAssignment = async (assignment) => {
      if (!confirm('האם למחוק את השיוך?')) return;
      setIsSaving(true);
      try {
        await TeacherAssignment.delete(assignment.id);
        const childName = coreChildren.find(c => c.id === assignment.child_id)?.hebrew_name || 'לא ידוע';
        await AuditLog.create({ entity_type: 'TeacherAssignment', entity_id: assignment.id, action: 'delete', details: `מחיקת שיוך מורה ל${childName}`, user_name: user?.hebrew_name });
        await refreshData();
      } catch (err) { 
        console.error("Error deleting assignment:", err);
        alert('שגיאה במחיקת השיוך');
      }
      finally { setIsSaving(false); }
    };

    // Check if user is parent
    if (user?.role !== 'parent') {
      return (
        <div className="p-8 text-center">
          <p className="text-red-500">גישה מוגבלת - רק להורים</p>
        </div>
      );
    }

    if (isAppLoading || !allData) {
      return (
        <div className="p-8 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      );
    }
    
    return (
      <div className="p-4 md:p-8" dir="rtl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">ניהול מורים ושיוכים</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="teachers">ניהול מורים</TabsTrigger>
            <TabsTrigger value="assignments">שיוכים לילדים</TabsTrigger>
          </TabsList>

          <TabsContent value="teachers">
            <TeachersManager 
              teachers={teachers || []} 
              subjects={subjects || []}
              onSave={handleSaveTeacher} 
              onDelete={handleDeleteTeacher}
              isSaving={isSaving}
            />
          </TabsContent>

          <TabsContent value="assignments">
            <TeacherAssignmentsManager 
              assignments={assignments || []}
              teachers={teachers || []}
              children={coreChildren}
              subjects={subjects || []}
              onSave={handleSaveAssignment} 
              onDelete={handleDeleteAssignment}
              isSaving={isSaving}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
}
