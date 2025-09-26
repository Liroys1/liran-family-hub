
/**
 * DashboardLayoutSettings.jsx - מסך ניהול תצורת הדשבורד עם Drag and Drop
 * מאפשר לאדמין להוסיף, להסיר ולשנות את סדר הווידג'טים עבור כל תפקיד.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { useDashboardConfig } from '@/components/hooks/useDashboardConfig';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { entities } from '@/components/lib/base44';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, Plus, Trash2, GripVertical } from 'lucide-react';

const ALL_WIDGETS = ['CountsCard', 'TodayTasksList', 'NextEventsList'];
const ROLES = ['parent', 'child', 'grandparent'];

function roleToHebrew(role) {
  if (role === 'parent') return 'הורה';
  if (role === 'child') return 'ילד/ה';
  return 'סבא/סבתא';
}

export default function DashboardLayoutSettings() {
  const { user } = useFamilyContext();
  const [selectedRole, setSelectedRole] = useState('parent');
  const { data: config, isLoading } = useDashboardConfig(user.family_id, selectedRole);
  const [localWidgets, setLocalWidgets] = useState([]);
  const queryClient = useQueryClient();

  // Set default widgets or loaded config widgets
  const defaultWidgets = useMemo(() => {
    return selectedRole === 'child'
      ? [{ type: 'TodayTasksList' }, { type: 'NextEventsList' }]
      : [{ type: 'CountsCard' }, { type: 'TodayTasksList' }];
  }, [selectedRole]);

  useEffect(() => {
    setLocalWidgets(config?.widgets ?? defaultWidgets);
  }, [config, defaultWidgets]);
  
  const saveMutation = useMutation({
    mutationFn: async (widgets) => {
      const payload = { 
        family_id: user.family_id, 
        role: selectedRole, 
        widgets 
      };
      if (config?.id) {
        return entities.update('DashboardConfig', config.id, payload);
      }
      return entities.create('DashboardConfig', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardConfig', user.family_id, selectedRole] });
    }
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(localWidgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setLocalWidgets(items);
  };
  
  const addWidget = (type) => {
    setLocalWidgets([...localWidgets, { type }]);
  };

  const removeWidget = (index) => {
    setLocalWidgets(localWidgets.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    saveMutation.mutate(localWidgets);
  };
  
  if (isLoading) {
    return <div className="flex justify-center items-center p-6"><Loader2 className="animate-spin h-8 w-8" /></div>;
  }

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">הגדרת תצורת הדשבורד</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>בחירת תפקיד לעריכה</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          {ROLES.map(r => (
            <Button key={r} onClick={() => setSelectedRole(r)} variant={selectedRole === r ? 'default' : 'outline'}>
              {roleToHebrew(r)}
            </Button>
          ))}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>סדר הווידג'טים עבור "{roleToHebrew(selectedRole)}"</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="widgets-list">
                {(provided) => (
                  <ul {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {localWidgets.map((w, i) => (
                      <Draggable key={`${w.type}-${i}`} draggableId={`${w.type}-${i}`} index={i}>
                        {(provided) => (
                          <li 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            {...provided.dragHandleProps}
                            className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                              <span className="font-mono text-sm">{w.type}</span>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeWidget(i)}>
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </li>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </ul>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>הוספת ווידג'ט</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {ALL_WIDGETS.map(w => (
              <Button key={w} variant="secondary" onClick={() => addWidget(w)} disabled={localWidgets.some(lw => lw.type === w)}>
                <Plus className="h-4 w-4 ml-2" />
                {w}
              </Button>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleSave} disabled={saveMutation.isLoading}>
          {saveMutation.isLoading && <Loader2 className="animate-spin ml-2 h-4 w-4" />}
          שמור שינויים
        </Button>
      </div>
    </div>
  );
}
