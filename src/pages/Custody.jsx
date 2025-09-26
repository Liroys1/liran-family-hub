
import React, { useState, useEffect } from 'react';
import { AuditLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Save, Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useCustody, useMutateCustodyTemplate, useMutateCustodyOverride } from '@/components/hooks/useCustody';

const PARENTS = ['חגית', 'לירן'];
const DAY_NAMES_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const DAY_NAMES_EN = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const WeekScheduleEditor = ({ weekData, weekTitle, onDayChange, isReadOnly }) => {
  return (
    <Card className="shadow-md">
      <CardHeader><CardTitle className="text-lg">{weekTitle}</CardTitle></CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {DAY_NAMES_EN.map((day, index) => (
            <div key={day} className="flex flex-col gap-2">
              <Label className="font-semibold text-slate-700">{DAY_NAMES_HE[index]}</Label>
              <Select
                value={weekData[day]}
                onValueChange={(value) => onDayChange(day, value)}
                disabled={isReadOnly}
              >
                <SelectTrigger>
                  <SelectValue placeholder="בחר/י הורה" />
                </SelectTrigger>
                <SelectContent>
                  {PARENTS.map(parent => (
                    <SelectItem key={parent} value={parent}>{parent}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default function CustodyPage() {
  const { user, family } = useFamilyContext();
  const { template: initialTemplate, overrides: initialOverrides, isLoading } = useCustody(family?.id);
  
  const [template, setTemplate] = useState(null);
  const [overrides, setOverrides] = useState([]);
  const [newOverride, setNewOverride] = useState({ date: '', responsible_parent: '', reason: '' });
  
  const { updateTemplateMutation } = useMutateCustodyTemplate(family?.id);
  const { createOverrideMutation } = useMutateCustodyOverride(family?.id);

  useEffect(() => {
    if (initialTemplate) {
      setTemplate(initialTemplate);
    }
    if (initialOverrides) {
      setOverrides(initialOverrides);
    }
  }, [initialTemplate, initialOverrides]);

  const handleTemplateChange = (week, day, parent) => {
    setTemplate(prev => ({
      ...prev,
      [week]: {
        ...prev[week],
        [day]: parent
      }
    }));
  };

  const handleSaveTemplate = async () => {
    if (!template) return;
    
    await updateTemplateMutation.mutateAsync({ id: template.id, ...template });
    
    if (user?.family_role === 'parent') {
        await AuditLog.create({
            family_id: family.id,
            entity_type: 'CustodyTemplate',
            entity_id: template.id,
            action: 'update',
            details: 'עדכון תבנית משמורת דו-שבועית',
            user_name: user.hebrew_name
        });
    }
    alert('התבנית נשמרה בהצלחה!');
  };

  const handleAddOverride = async () => {
    if (!newOverride.date || !newOverride.responsible_parent) {
      alert('יש למלא תאריך והורה אחראי.');
      return;
    }

    const created = await createOverrideMutation.mutateAsync({ ...newOverride, family_id: family.id });

    if (user?.family_role === 'parent' && created) {
        await AuditLog.create({
            family_id: family.id,
            entity_type: 'CustodyOverride',
            entity_id: created.id,
            action: 'create',
            details: `הוספת חריג בתאריך ${newOverride.date} לאחריות ${newOverride.responsible_parent}`,
            user_name: user.hebrew_name
        });
    }

    setNewOverride({ date: '', responsible_parent: '', reason: '' });
  };
  
  const isReadOnly = user?.family_role !== 'parent';

  if (isLoading || !user || !family) {
    return (
      <div className="p-8 flex justify-center items-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8" dir="rtl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">משמורת וחלוקת אחריות</h1>
        {!isReadOnly && (
          <Button onClick={handleSaveTemplate} disabled={updateTemplateMutation.isPending}>
            <Save className="w-4 h-4 ml-2" />
            {updateTemplateMutation.isPending ? 'שומר...' : 'שמור תבנית'}
          </Button>
        )}
      </div>

      {template && (
        <div className="space-y-6 mb-12">
          <WeekScheduleEditor
            weekData={template.week_a}
            weekTitle="שבוע א׳"
            onDayChange={(day, parent) => handleTemplateChange('week_a', day, parent)}
            isReadOnly={isReadOnly}
          />
          <WeekScheduleEditor
            weekData={template.week_b}
            weekTitle="שבוע ב׳"
            onDayChange={(day, parent) => handleTemplateChange('week_b', day, parent)}
            isReadOnly={isReadOnly}
          />
        </div>
      )}

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Calendar className="w-6 h-6 text-purple-500" />
            חריגים והחלפות
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isReadOnly && (
            <div className="p-4 bg-slate-50 rounded-lg border space-y-4">
              <h3 className="font-bold text-lg">הוספת חריג חדש</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="space-y-1">
                  <Label htmlFor="override-date">תאריך</Label>
                  <Input 
                    id="override-date"
                    type="date" 
                    value={newOverride.date} 
                    onChange={(e) => setNewOverride({...newOverride, date: e.target.value})}
                  />
                </div>
                 <div className="space-y-1">
                  <Label htmlFor="override-parent">הורה אחראי</Label>
                   <Select value={newOverride.responsible_parent} onValueChange={(value) => setNewOverride({...newOverride, responsible_parent: value})}>
                      <SelectTrigger><SelectValue placeholder="בחר/י הורה" /></SelectTrigger>
                      <SelectContent>
                        {PARENTS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                      </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                   <Label htmlFor="override-reason">סיבה (אופציונלי)</Label>
                  <Input 
                    id="override-reason"
                    value={newOverride.reason} 
                    onChange={(e) => setNewOverride({...newOverride, reason: e.target.value})}
                  />
                </div>
              </div>
              <Button onClick={handleAddOverride} disabled={createOverrideMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
                <Plus className="w-4 h-4 ml-2" /> הוסף חריג
              </Button>
            </div>
          )}

          <div>
            <h4 className="font-semibold mb-3">חריגים קיימים</h4>
            <div className="space-y-3">
              {overrides.length > 0 ? (
                overrides.map((override) => (
                  <div key={override.id} className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                    <div>
                      <p className="font-semibold text-slate-800">
                        {format(new Date(override.date), 'EEEE, d MMMM yyyy', { locale: he })}
                      </p>
                      {override.reason && <p className="text-sm text-slate-500">{override.reason}</p>}
                    </div>
                    <Badge 
                      className="px-3 py-1 text-sm"
                      style={{ 
                        backgroundColor: override.responsible_parent === 'חגית' ? '#9333EA' : '#2563EB', 
                        color: 'white' 
                      }}
                    >
                      {override.responsible_parent}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 text-center py-4">אין חריגים רשומים</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
