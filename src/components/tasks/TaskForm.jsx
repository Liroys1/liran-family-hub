import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import { Upload, Loader2, X, Plus, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const TASK_KINDS = [
  { value: 'house_fixed', label: 'מטלות בית קבועות', description: 'מטלות שמוקצות לאדם מסוים' },
  { value: 'house_variable', label: 'מטלות בית משתנות', description: 'מטלות שכולם יכולים לבצע' },
  { value: 'child_homework', label: 'שיעורי בית', description: 'משימות לימודיות לילדים' },
  { value: 'other', label: 'אחר', description: 'משימות כלליות' }
];

const VISIBILITY_SCOPES = [
  { value: 'owner_only', label: 'רק לבעלים', description: 'רק מי שיצר את המשימה רואה אותה' },
  { value: 'parents_only', label: 'להורים בלבד', description: 'רק הורים רואים את המשימה' },
  { value: 'family', label: 'למשפחה כולה', description: 'כל חברי המשפחה רואים את המשימה' }
];

export default function TaskForm({ task, childrenList, membersList, subjectsList, allTasks, onSave, onCancel, user }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        kind: 'other',
        visibility_scope: 'family',
        owner_member_id: '',
        child_id: '',
        subject_id: '',
        image_url: null,
        due_date: new Date().toISOString().split('T')[0],
        due_time: '',
        is_recurring: false,
        recurring_rule: '',
        recurring_until: '',
        skip_dates: [],
        status: 'open',
        tags: [],
        notes: '',
        created_by_parent: user?.hebrew_name || ''
    });

    const [newTag, setNewTag] = useState('');
    const [uploadedImage, setUploadedImage] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (task) {
            setFormData({
                title: task.title || '',
                description: task.description || '',
                kind: task.kind || 'other',
                visibility_scope: task.visibility_scope || 'family',
                owner_member_id: task.owner_member_id || '',
                child_id: task.child_id || '',
                subject_id: task.subject_id || '',
                image_url: task.image_url || null,
                due_date: task.due_date || new Date().toISOString().split('T')[0],
                due_time: task.due_time || '',
                is_recurring: task.is_recurring || false,
                recurring_rule: task.recurring_rule || '',
                recurring_until: task.recurring_until || '',
                skip_dates: task.skip_dates || [],
                status: task.status || 'open',
                tags: task.tags || [],
                notes: task.notes || '',
                created_by_parent: task.created_by_parent || user?.hebrew_name || ''
            });
            if (task.image_url) {
                setUploadedImage(task.image_url);
            }
        }
    }, [task, user]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            handleChange('tags', [...formData.tags, newTag.trim()]);
            setNewTag('');
        }
    };

    const handleRemoveTag = (tagToRemove) => {
        handleChange('tags', formData.tags.filter(tag => tag !== tagToRemove));
    };

    const handleKindChange = (kind) => {
        let updates = { kind };
        
        // Set appropriate defaults based on kind
        switch (kind) {
            case 'house_fixed':
                updates.visibility_scope = 'owner_only';
                updates.owner_member_id = user?.member_id || '';
                break;
            case 'house_variable':
                updates.visibility_scope = 'family';
                updates.owner_member_id = '';
                break;
            case 'child_homework':
                updates.visibility_scope = 'parents_only';
                updates.owner_member_id = '';
                break;
            default:
                updates.visibility_scope = 'family';
                break;
        }
        
        setFormData(prev => ({ ...prev, ...updates }));
    };

    const handleImageUpload = async (file) => {
        if (!file) return;
        
        setIsUploading(true);
        try {
            const { file_url } = await UploadFile({ file });
            setUploadedImage(file_url);
            handleChange('image_url', file_url);
            
            // Auto-analyze for homework
            if (formData.kind === 'child_homework' && formData.subject_id) {
                await analyzeImage(file_url);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert('שגיאה בהעלאת התמונה');
        } finally {
            setIsUploading(false);
        }
    };

    const analyzeImage = async (imageUrl) => {
        setIsAnalyzing(true);
        try {
            const schema = {
                type: "object",
                properties: {
                    homework_tasks: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                title: { type: "string" },
                                description: { type: "string" }
                            }
                        }
                    }
                }
            };

            const result = await ExtractDataFromUploadedFile({
                file_url: imageUrl,
                json_schema: schema
            });

            if (result.status === 'success' && result.output && result.output.homework_tasks) {
                const tasks = result.output.homework_tasks;
                if (tasks.length > 0) {
                    const firstTask = tasks[0];
                    setFormData(prev => ({
                        ...prev,
                        title: firstTask.title || prev.title,
                        description: firstTask.description || firstTask.title || prev.description
                    }));
                }
            }
        } catch (error) {
            console.error("Error analyzing image:", error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.description.trim()) {
            alert('יש להזין תיאור למשימה');
            return;
        }

        // Kind-specific validation
        if (formData.kind === 'house_fixed' && !formData.owner_member_id) {
            alert('יש לבחור בעלים למטלות בית קבועות');
            return;
        }

        if (formData.kind === 'child_homework') {
            if (!formData.child_id) {
                alert('יש לבחור ילד לשיעורי בית');
                return;
            }
            if (!formData.subject_id) {
                alert('יש לבחור מקצוע לשיעור בית');
                return;
            }
        }
        
        onSave(formData);
    };

    // Filter members and children based on kind
    const availableOwners = membersList?.filter(m => m.role === 'parent') || [];
    const availableChildren = childrenList || [];

    return (
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label>כותרת המשימה</Label>
                    <Input 
                        value={formData.title} 
                        onChange={e => handleChange('title', e.target.value)} 
                        placeholder="כותרת קצרה למשימה"
                    />
                </div>

                <div className="space-y-2">
                    <Label>תיאור המשימה *</Label>
                    <Textarea 
                        value={formData.description} 
                        onChange={e => handleChange('description', e.target.value)} 
                        placeholder="פרט מה צריך לעשות..."
                        className="min-h-[80px]"
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>סוג המשימה</Label>
                        <Select value={formData.kind} onValueChange={handleKindChange}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {TASK_KINDS.map(kind => (
                                    <SelectItem key={kind.value} value={kind.value}>
                                        <div>
                                            <div className="font-medium">{kind.label}</div>
                                            <div className="text-xs text-gray-500">{kind.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>נראות</Label>
                        <Select value={formData.visibility_scope} onValueChange={value => handleChange('visibility_scope', value)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                {VISIBILITY_SCOPES.map(scope => (
                                    <SelectItem key={scope.value} value={scope.value}>
                                        <div>
                                            <div className="font-medium">{scope.label}</div>
                                            <div className="text-xs text-gray-500">{scope.description}</div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Owner selection for house_fixed */}
                {formData.kind === 'house_fixed' && (
                    <div className="space-y-2">
                        <Label>בעלים *</Label>
                        <Select value={formData.owner_member_id} onValueChange={value => handleChange('owner_member_id', value)}>
                            <SelectTrigger><SelectValue placeholder="בחר בעלים" /></SelectTrigger>
                            <SelectContent>
                                {availableOwners.map(member => (
                                    <SelectItem key={member.id} value={member.id}>
                                        <div className="flex items-center gap-2">
                                            <div 
                                                className="w-3 h-3 rounded-full" 
                                                style={{ backgroundColor: member.color }}
                                            />
                                            {member.hebrew_name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Child and subject selection for homework */}
                {formData.kind === 'child_homework' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>ילד *</Label>
                            <Select value={formData.child_id} onValueChange={value => handleChange('child_id', value)}>
                                <SelectTrigger><SelectValue placeholder="בחר ילד" /></SelectTrigger>
                                <SelectContent>
                                    {availableChildren.map(child => (
                                        <SelectItem key={child.id} value={child.id}>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-6 h-6">
                                                    <AvatarImage src={child.image_url} />
                                                    <AvatarFallback style={{backgroundColor: child.color, color: 'white'}}>
                                                        {child.hebrew_name?.[0]}
                                                    </AvatarFallback>
                                                </Avatar>
                                                {child.hebrew_name}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>מקצוע *</Label>
                            <Select value={formData.subject_id} onValueChange={value => handleChange('subject_id', value)}>
                                <SelectTrigger><SelectValue placeholder="בחר מקצוע" /></SelectTrigger>
                                <SelectContent>
                                    {(subjectsList || []).filter(s => s.is_active).map(subject => (
                                        <SelectItem key={subject.id} value={subject.id}>{subject.hebrew_name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Image upload for homework */}
                {formData.kind === 'child_homework' && (
                    <div className="space-y-2">
                        <Label>תמונת שיעורי בית (אופציונלי)</Label>
                        <div className="space-y-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e.target.files[0])}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                            >
                                {isUploading ? (
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                ) : uploadedImage ? (
                                    <div className="relative">
                                        <img src={uploadedImage} alt="Uploaded" className="max-h-28 rounded" />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="icon"
                                            className="absolute -top-2 -right-2 h-6 w-6"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setUploadedImage(null);
                                                handleChange('image_url', null);
                                            }}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500">לחץ להעלאת תמונה</p>
                                    </div>
                                )}
                            </label>
                            
                            {isAnalyzing && (
                                <div className="text-center text-sm text-blue-600">
                                    <Loader2 className="w-4 h-4 inline animate-spin mr-2" />
                                    מנתח את התמונה...
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Due date and time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>תאריך יעד</Label>
                        <Input 
                            type="date" 
                            value={formData.due_date} 
                            onChange={e => handleChange('due_date', e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>שעת יעד (אופציונלי)</Label>
                        <Input 
                            type="time" 
                            value={formData.due_time} 
                            onChange={e => handleChange('due_time', e.target.value)} 
                        />
                    </div>
                </div>

                {/* Recurring task toggle */}
                <div className="flex items-center justify-between p-3 border rounded-lg">
                    <Label>משימה חוזרת</Label>
                    <Switch 
                        checked={formData.is_recurring} 
                        onCheckedChange={value => handleChange('is_recurring', value)} 
                    />
                </div>

                {/* Recurring rule input */}
                {formData.is_recurring && (
                    <div className="space-y-2">
                        <Label>כלל חזרה</Label>
                        <Select value={formData.recurring_rule} onValueChange={value => handleChange('recurring_rule', value)}>
                            <SelectTrigger><SelectValue placeholder="בחר תדירות" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="FREQ=DAILY">יומי</SelectItem>
                                <SelectItem value="FREQ=WEEKLY">שבועי</SelectItem>
                                <SelectItem value="FREQ=WEEKLY;BYDAY=SU,WE">ראשון ורביעי</SelectItem>
                                <SelectItem value="FREQ=WEEKLY;BYDAY=MO,TU,WE,TH">א׳-ה׳</SelectItem>
                                <SelectItem value="FREQ=MONTHLY">חודשי</SelectItem>
                            </SelectContent>
                        </Select>
                        
                        {formData.recurring_rule && (
                            <div className="space-y-2">
                                <Label>עד תאריך (אופציונלי)</Label>
                                <Input 
                                    type="date" 
                                    value={formData.recurring_until} 
                                    onChange={e => handleChange('recurring_until', e.target.value)} 
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Tags */}
                <div className="space-y-2">
                    <Label>תגיות</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                        {formData.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {tag}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 ml-1"
                                    onClick={() => handleRemoveTag(tag)}
                                >
                                    <X className="w-3 h-3" />
                                </Button>
                            </Badge>
                        ))}
                    </div>
                    <div className="flex gap-2">
                        <Input
                            value={newTag}
                            onChange={(e) => setNewTag(e.target.value)}
                            placeholder="הוסף תגית..."
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        />
                        <Button type="button" variant="outline" onClick={handleAddTag}>
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                    <Label>הערות</Label>
                    <Textarea
                        value={formData.notes}
                        onChange={e => handleChange('notes', e.target.value)}
                        placeholder="הערות נוספות..."
                        className="h-20"
                    />
                </div>
                
                <div className="flex justify-end gap-3 pt-4 sticky bottom-0 bg-white">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        ביטול
                    </Button>
                    <Button type="submit">
                        {task ? 'עדכן משימה' : 'צור משימה'}
                    </Button>
                </div>
            </form>
        </div>
    );
}