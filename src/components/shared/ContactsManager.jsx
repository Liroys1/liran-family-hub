
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Edit, Save, Trash2, X, Phone, FileUp, Loader2 } from 'lucide-react';
import { UploadFile, ExtractDataFromUploadedFile } from '@/api/integrations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';

const CsvImportDialog = ({ open, onOpenChange, onImport }) => {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleImport = async () => {
        if (!file) {
            alert("יש לבחור קובץ");
            return;
        }
        setIsLoading(true);
        try {
            const { file_url } = await UploadFile({ file });
            const schema = {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        contact_name: { type: "string" },
                        contact_phone: { type: "string" },
                        mother_name: { type: "string" },
                        mother_phone: { type: "string" },
                        father_name: { type: "string" },
                        father_phone: { type: "string" }
                    },
                    required: ["contact_name"] // Assuming contact_name is always required for a valid contact
                }
            };
            const result = await ExtractDataFromUploadedFile({ file_url, json_schema: schema });
            
            if (result.status === 'success' && Array.isArray(result.output)) {
                onImport(result.output);
                setFile(null); // Clear file input after successful import
                onOpenChange(false);
            } else {
                console.error("CSV Import failed or returned unexpected format:", result);
                alert("שגיאה בניתוח הקובץ. ודא שהקובץ בפורמט CSV נכון וכולל עמודות חובה.");
            }
        } catch (error) {
            console.error("CSV Import Error:", error);
            alert("שגיאה בתהליך הייבוא.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>ייבוא אנשי קשר מקובץ CSV</DialogTitle>
                    <DialogDescription>
                        העלה קובץ CSV עם העמודות: contact_name, contact_phone, mother_name, mother_phone, father_name, father_phone. 
                        שדה 'contact_name' הוא שדה חובה.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <Label htmlFor="csv-upload">בחר קובץ</Label>
                    <Input id="csv-upload" type="file" accept=".csv" onChange={handleFileChange} />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => { onOpenChange(false); setFile(null); }}>ביטול</Button>
                    <Button onClick={handleImport} disabled={isLoading || !file}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <FileUp className="w-4 h-4 ml-2" />}
                        ייבא
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default function ContactsManager({ child, contacts, onSave, onDelete, isReadOnly }) {
  const [editingContact, setEditingContact] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleSave = async () => {
    if (!editingContact.contact_name) {
      alert('יש למלא שם עבור איש הקשר.');
      return;
    }
    await onSave({...editingContact, child_id: child.id});
    setEditingContact(null);
  };

  const makePhoneCall = (phone) => {
    if (phone) {
      window.location.href = `tel:${phone}`;
    }
  };

  const sendWhatsApp = (phone) => {
    if (phone) {
      // Assuming Israeli numbers, replace leading 0 with 972
      window.open(`https://wa.me/972${phone.replace(/^0/, '')}`, '_blank');
    }
  };

  const handleBulkImport = (importedContacts) => {
    importedContacts.forEach(contact => {
        // Only save contacts that have a contact_name as it's required
        if (contact.contact_name) {
            onSave({ ...contact, child_id: child.id });
        }
    });
    alert(`${importedContacts.length} אנשי קשר יובאו בהצלחה!`);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>רשימת קשר - {child.hebrew_name}</CardTitle>
        {!isReadOnly && (
            <div className="flex gap-2">
                 <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
                    <FileUp className="w-4 h-4 ml-2" /> ייבוא מקובץ
                </Button>
                <Button size="sm" onClick={() => setEditingContact({ contact_name: '', contact_phone: '', mother_name: '', mother_phone: '', father_name: '', father_phone: '' })}><Plus className="w-4 h-4 ml-2" />הוסף</Button>
            </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {editingContact ? (
          <Card className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1"><Label>שם החבר/ה</Label><Input value={editingContact.contact_name} onChange={e => setEditingContact({...editingContact, contact_name: e.target.value})} /></div>
              <div className="space-y-1"><Label>טלפון החבר/ה</Label><Input value={editingContact.contact_phone || ''} onChange={e => setEditingContact({...editingContact, contact_phone: e.target.value})} /></div>
              <div className="space-y-1"><Label>שם האמא</Label><Input value={editingContact.mother_name || ''} onChange={e => setEditingContact({...editingContact, mother_name: e.target.value})} /></div>
              <div className="space-y-1"><Label>טלפון האמא</Label><Input value={editingContact.mother_phone || ''} onChange={e => setEditingContact({...editingContact, mother_phone: e.target.value})} /></div>
              <div className="space-y-1"><Label>שם האבא</Label><Input value={editingContact.father_name || ''} onChange={e => setEditingContact({...editingContact, father_name: e.target.value})} /></div>
              <div className="space-y-1"><Label>טלפון האבא</Label><Input value={editingContact.father_phone || ''} onChange={e => setEditingContact({...editingContact, father_phone: e.target.value})} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}><Save className="w-4 h-4 ml-2" />שמור</Button>
              <Button variant="outline" onClick={() => setEditingContact(null)}><X className="w-4 h-4 ml-2"/>ביטול</Button>
            </div>
          </Card>
        ) : null}
        
        <div className="space-y-3">
          {contacts.length === 0 && <p className="text-sm text-slate-500">לא הוגדרו אנשי קשר לילד זה.</p>}
          {contacts.map(c => (
            <div key={c.id} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-bold text-lg">{c.contact_name}</p>
                  {c.contact_phone && (
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="outline" onClick={() => makePhoneCall(c.contact_phone)}>
                        <Phone className="w-3 h-3 ml-1" /> התקשר
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => sendWhatsApp(c.contact_phone)}>
                        💬 וואטסאפ
                      </Button>
                    </div>
                  )}
                </div>
                {!isReadOnly && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setEditingContact({...c})}><Edit className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => onDelete(c)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t">
                {c.mother_name && (
                  <div>
                    <p className="text-sm font-semibold text-slate-600">אמא: {c.mother_name}</p>
                    {c.mother_phone && (
                      <div className="flex gap-2 mt-1">
                        <Button size="sm" variant="ghost" onClick={() => makePhoneCall(c.mother_phone)}>
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => sendWhatsApp(c.mother_phone)}>
                          💬
                        </Button>
                        <span className="text-xs text-slate-500">{c.mother_phone}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {c.father_name && (
                  <div>
                    <p className="text-sm font-semibold text-slate-600">אבא: {c.father_name}</p>
                    {c.father_phone && (
                      <div className="flex gap-2 mt-1">
                        <Button size="sm" variant="ghost" onClick={() => makePhoneCall(c.father_phone)}>
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => sendWhatsApp(c.father_phone)}>
                          💬
                        </Button>
                        <span className="text-xs text-slate-500">{c.father_phone}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <CsvImportDialog open={isImportOpen} onOpenChange={setIsImportOpen} onImport={handleBulkImport} />
      </CardContent>
    </Card>
  );
};
