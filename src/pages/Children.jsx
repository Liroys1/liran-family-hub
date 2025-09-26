
import React, { useState, useEffect } from 'react';
import { AuditLog, Child, Member, UploadFile } from '@/api/integrations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Save, Trash2, Clock, Loader2 } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import ScheduleManager from '@/components/shared/ScheduleManager';
import ActivitiesManager from '@/components/shared/ActivitiesManager';
import ContactsManager from '@/components/shared/ContactsManager';

import { useFamilyContext } from '@/components/context/FamilyContext';
import { useChildrenWithMembers } from '@/components/hooks/useChildrenWithMembers';
import { useUpdateChild } from '@/components/hooks/useChildren';
import { useUpdateMember } from '@/components/hooks/useMembers'; // New hook for member mutations
import { useSchedulesData, useMutateSchedule } from '@/components/hooks/useSchedules';
import { useActivities, useMutateActivity } from '@/components/hooks/useActivities';
import { useClassContacts, useMutateContact } from '@/components/hooks/useClassContacts';


const ChildCard = ({ child, onSelect, isSelected, onDelete, userMember }) => {
  const initial = child.hebrew_name ? child.hebrew_name[0] : '';
  const isReadOnly = userMember?.role !== 'parent';
  
  return (
    <Card className={`shadow-lg border-none hover:shadow-xl transition-shadow duration-300 cursor-pointer ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <div onClick={() => onSelect(child)}>
        <CardHeader className="flex flex-row items-center gap-4 p-4">
          <Avatar className="w-16 h-16 text-2xl">
            <AvatarImage src={child.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${child.hebrew_name}`} />
            <AvatarFallback style={{ backgroundColor: child.color, color: 'white' }}>{initial}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl font-bold">{child.hebrew_name}</CardTitle>
            <p className="text-slate-500">כיתה {child.grade}</p>
          </div>
          {!isReadOnly && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(child);
              }}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /><span>{child.school || 'לא הוגדר'}</span></div>
          </div>
        </CardContent>
      </div>
    </Card>
  );
};

const ChildDetailsTabs = ({ 
    child, userMember, onSaveChild, onSaveMember,
    // Schedules
    schedulesData, onSaveSchedule, onDeleteSchedule,
    // Activities
    activities, allChildren, onSaveActivity, onDeleteActivity,
    // Contacts
    contacts, onSaveContact, onDeleteContact
}) => {
  const [editingChild, setEditingChild] = useState({});
  const [editingMember, setEditingMember] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    // Split combined child object into two editable states
    // child object from useChildrenWithMembers should contain both child and member data
    const { id, member_id, hebrew_name, color, image_url, grade, school, teacher, teacher_phone, whatsapp_group_teacher, whatsapp_group_parents, allergies, medical_notes, ...restChildFields } = child;
    setEditingChild({ id, grade, school, teacher, teacher_phone, whatsapp_group_teacher, whatsapp_group_parents, allergies, medical_notes, ...restChildFields });
    setEditingMember({ id: member_id, hebrew_name, color, image_url });
  }, [child]);

  const handleChildFieldChange = (field, value) => {
    setEditingChild(prev => ({ ...prev, [field]: value }));
  };

  const handleMemberFieldChange = (field, value) => {
    setEditingMember(prev => ({ ...prev, [field]: value }));
  };
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
        const { file_url } = await UploadFile({ file });
        const updatedMember = { ...editingMember, image_url: file_url };
        setEditingMember(updatedMember);
        await onSaveMember(updatedMember); // Directly save member after upload
    } catch (error) {
        console.error("Error uploading image:", error);
    } finally {
        setIsUploading(false);
    }
  };

  const handleSave = () => {
      onSaveChild(editingChild);
      onSaveMember(editingMember);
  };

  const childActivities = (activities || []).filter(act => act.child_ids?.includes(child.id));
  const childContacts = (contacts || []).filter(c => c.child_id === child.id);
  const childSchedules = (schedulesData?.schedules || []).filter(s => s.child_id === child.id);

  const isReadOnly = userMember?.role !== 'parent';

  return (
    <Tabs defaultValue="details" className="w-full">
      <div className="overflow-x-auto">
        <TabsList className="w-full sm:w-auto justify-start sm:justify-center">
          <TabsTrigger value="details" className="flex-shrink-0">פרטים</TabsTrigger>
          <TabsTrigger value="schedule" className="flex-shrink-0">מערכת שעות</TabsTrigger>
          <TabsTrigger value="activities" className="flex-shrink-0">חוגים</TabsTrigger>
          <TabsTrigger value="contacts" className="flex-shrink-0">רשימת קשר</TabsTrigger>
        </TabsList>
      </div>
      
      <TabsContent value="details" className="mt-4">
        <Card>
          <CardHeader><CardTitle>פרטי {editingMember.hebrew_name}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
             <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="w-24 h-24 text-3xl">
                <AvatarImage src={editingMember.image_url || `https://api.dicebear.com/7.x/initials/svg?seed=${editingMember.hebrew_name}`} />
                <AvatarFallback style={{ backgroundColor: editingMember.color, color: 'white' }}>{editingMember.hebrew_name?.[0] || '?'}</AvatarFallback>
              </Avatar>
              <div className="space-y-2 flex-1 w-full sm:w-auto">
                <Label htmlFor="image-upload">תמונת פרופיל</Label>
                <Input id="image-upload" type="file" onChange={handleImageUpload} accept="image/*" disabled={isUploading || isReadOnly} />
                {isUploading && <div className="flex items-center text-sm text-slate-500"><Loader2 className="w-4 h-4 mr-2 animate-spin"/> מעלה...</div>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1"><Label>שם</Label><Input value={editingMember.hebrew_name || ''} onChange={e => handleMemberFieldChange('hebrew_name', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-1"><Label>כיתה</Label><Input value={editingChild.grade || ''} onChange={e => handleChildFieldChange('grade', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-1"><Label>בית ספר</Label><Input value={editingChild.school || ''} onChange={e => handleChildFieldChange('school', e.target.value)} disabled={isReadOnly} /></div>
              <div className="space-y-1">
                <Label>צבע</Label>
                <div className="flex gap-2">
                  <Input type="color" value={editingMember.color || ''} onChange={e => handleMemberFieldChange('color', e.target.value)} className="w-16 h-10 p-1" disabled={isReadOnly} />
                  <Input value={editingMember.color || ''} onChange={e => handleMemberFieldChange('color', e.target.value)} className="flex-1" disabled={isReadOnly} />
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader><CardTitle className="text-base">פרטי קשר - בית ספר</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1"><Label>שם המורה</Label><Input value={editingChild.teacher || ''} onChange={e => handleChildFieldChange('teacher', e.target.value)} disabled={isReadOnly} /></div>
                <div className="space-y-1"><Label>טלפון המורה</Label><Input value={editingChild.teacher_phone || ''} onChange={e => handleChildFieldChange('teacher_phone', e.target.value)} disabled={isReadOnly} /></div>
                <div className="col-span-1 sm:col-span-2 space-y-1"><Label>קישור וואטסאפ (הודעות מורה)</Label><Input value={editingChild.whatsapp_group_teacher || ''} onChange={e => handleChildFieldChange('whatsapp_group_teacher', e.target.value)} disabled={isReadOnly} /></div>
                <div className="col-span-1 sm:col-span-2 space-y-1"><Label>קישור וואטסאפ (הורים)</Label><Input value={editingChild.whatsapp_group_parents || ''} onChange={e => handleChildFieldChange('whatsapp_group_parents', e.target.value)} disabled={isReadOnly} /></div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader><CardTitle className="text-base">מידע נוסף</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><Label>אלרגיות</Label><Input value={editingChild.allergies || ''} onChange={(e) => handleChildFieldChange('allergies', e.target.value)} disabled={isReadOnly} /></div>
                <div><Label>הערות רפואיות</Label><Input value={editingChild.medical_notes || ''} onChange={(e) => handleChildFieldChange('medical_notes', e.target.value)} disabled={isReadOnly} /></div>
              </CardContent>
            </Card>
            
            {!isReadOnly && (
              <Button onClick={handleSave}><Save className="w-4 h-4 ml-2"/>שמור שינויים</Button>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="schedule">
        {schedulesData && <ScheduleManager 
            child={child} 
            schedules={childSchedules} 
            subjects={schedulesData.subjects} 
            teachers={schedulesData.teachers} 
            assignments={schedulesData.assignments} 
            onSave={onSaveSchedule} 
            onDelete={onDeleteSchedule} 
            isReadOnly={isReadOnly} 
        />}
      </TabsContent>
      
      <TabsContent value="activities">
        <ActivitiesManager child={child} activities={childActivities} onSave={onSaveActivity} onDelete={onDeleteActivity} isReadOnly={isReadOnly} children={allChildren} />
      </TabsContent>
      
      <TabsContent value="contacts">
        <ContactsManager child={child} contacts={childContacts} onSave={onSaveContact} onDelete={onDeleteContact} isReadOnly={isReadOnly} />
      </TabsContent>
    </Tabs>
  );
};


export default function ChildrenPage() {
  const { family, member: userMember } = useFamilyContext();
  
  // Guard clause: Wait for context to be fully loaded.
  // This must be placed before any other hooks that depend on `family` or `userMember`
  // to ensure hooks are called unconditionally.
  if (!family || !userMember) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const [selectedChild, setSelectedChild] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [childToDelete, setChildToDelete] = useState(null);

  const familyId = family.id; // `family` is guaranteed to exist here
  const isParent = userMember.role === 'parent'; // `userMember` is guaranteed to exist here

  // --- Data Fetching using React Query Hooks ---
  const { data: children, isLoading: isLoadingChildren } = useChildrenWithMembers(familyId);
  const { data: schedulesData, isLoading: isLoadingSchedules } = useSchedulesData(familyId);
  const { data: activities, isLoading: isLoadingActivities } = useActivities(familyId);
  const { data: contacts, isLoading: isLoadingContacts } = useClassContacts(familyId);

  // --- Mutations using React Query Hooks ---
  const updateChildMutation = useUpdateChild();
  const updateMemberMutation = useUpdateMember(); // New mutation hook for members
  const { createMutation: scheduleCreate, updateMutation: scheduleUpdate, deleteMutation: scheduleDelete } = useMutateSchedule(familyId);
  const { createMutation: activityCreate, updateMutation: activityUpdate, deleteMutation: activityDelete } = useMutateActivity(familyId);
  const { createMutation: contactCreate, updateMutation: contactUpdate, deleteMutation: contactDelete } = useMutateContact(familyId);
  
  // Set initial selected child
  useEffect(() => {
    if (!selectedChild && children && children.length > 0) {
      setSelectedChild(children[0]);
    } else if (selectedChild && children && !children.some(c => c.id === selectedChild.id)) {
        // If the currently selected child was deactivated/removed, select the first available
        setSelectedChild(children.length > 0 ? children[0] : null);
    }
  }, [children, selectedChild]);

  const handleSaveChild = async (childData) => {
    await updateChildMutation.mutateAsync({ id: childData.id, ...childData });
    if (isParent) {
        await AuditLog.create({ family_id: family.id, entity_type: 'Child', entity_id: childData.id, action: 'update', details: `עדכון פרטי ילד (נתונים ספציפיים): ${childData.hebrew_name}`, user_name: userMember.hebrew_name });
    }
    // No alert here, alert comes after both child and member save
  };

  const handleSaveMember = async (memberData) => {
    await updateMemberMutation.mutateAsync({ id: memberData.id, ...memberData });
    if (isParent) {
      await AuditLog.create({ family_id: family.id, entity_type: 'Member', entity_id: memberData.id, action: 'update', details: `עדכון פרטי חבר משפחה (ילד): ${memberData.hebrew_name}`, user_name: userMember.hebrew_name });
    }
    alert("פרטי הילד עודכנו בהצלחה");
  };


  const handleDeleteRequest = (child) => {
    setChildToDelete(child);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteChild = async () => {
    if (!childToDelete) return;
    // Deactivating the child profile instead of deleting
    await updateChildMutation.mutateAsync({ id: childToDelete.id, is_active: false });
    if (isParent) {
      await AuditLog.create({ family_id: family.id, entity_type: 'Child', entity_id: childToDelete.id, action: 'deactivate', details: `השבתת פרופיל ילד: ${childToDelete.hebrew_name}`, user_name: userMember.hebrew_name });
    }
    setDeleteConfirmOpen(false);
    alert("פרופיל הילד הושבת בהצלחה");
  };
  
  // --- Wrappers for mutations to pass to components ---
  const handleSaveSchedule = (data) => data.id ? scheduleUpdate.mutate(data) : scheduleCreate.mutate({ ...data, family_id: familyId });
  const handleDeleteSchedule = (data) => scheduleDelete.mutate(data);
  const handleSaveActivity = (data) => data.id ? activityUpdate.mutate(data) : activityCreate.mutate(data);
  const handleDeleteActivity = (data) => activityDelete.mutate(data.id);
  const handleSaveContact = (data) => data.id ? contactUpdate.mutate(data) : contactCreate.mutate(data);
  const handleDeleteContact = (data) => contactDelete.mutate(data.id);


  if (isLoadingChildren) { // Now only check isLoadingChildren, as userMember is guaranteed
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Filter children to only show active ones for the UI
  const activeChildren = children ? children.filter(child => child.is_active !== false) : [];

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">הילדים שלנו</h1>
      </div>
      
      {activeChildren.length === 0 ? (
        <p className="text-slate-500 text-center">לא נמצאו ילדים פעילים במערכת.</p>
      ) : (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeChildren.map(child => (
                <ChildCard 
                  key={child.id} 
                  child={child} 
                  onSelect={setSelectedChild}
                  onDelete={handleDeleteRequest}
                  isSelected={selectedChild?.id === child.id}
                  userMember={userMember}
                />
              ))}
            </div>
          
          {selectedChild && (
            <ChildDetailsTabs 
              child={selectedChild}
              userMember={userMember}
              onSaveChild={handleSaveChild}
              onSaveMember={handleSaveMember}
              // Pass data and mutations to tabs
              schedulesData={schedulesData}
              onSaveSchedule={handleSaveSchedule}
              onDeleteSchedule={handleDeleteSchedule}
              activities={activities}
              allChildren={activeChildren} // Pass active children
              onSaveActivity={handleSaveActivity}
              onDeleteActivity={handleDeleteActivity}
              contacts={contacts}
              onSaveContact={handleSaveContact}
              onDeleteContact={handleDeleteContact}
            />
          )}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>אישור השבתה</DialogTitle>
            <DialogDescription>האם אתה בטוח שברצונך להשבית את פרופיל הילד {childToDelete?.hebrew_name}? פרופיל מושבת לא יופיע יותר למשתמשים אך ניתן לשחזור.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)}>ביטול</Button>
            <Button variant="destructive" onClick={confirmDeleteChild} disabled={updateChildMutation.isPending}>
                {updateChildMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin"/> : <Trash2 className="w-4 h-4 ml-2" />}
                 השבת
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
