/**
 * Invites.jsx - דף ניהול הזמנות למשפחה
 * מאפשר להורים ליצור קישורי הצטרפות עם תפקידים שונים
 */
import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { entities } from '@/components/lib/base44';
import { useFamilyContext } from '@/components/context/FamilyContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Copy } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function Invites() {
  const { user, family } = useFamilyContext();
  const [created, setCreated] = useState(null);
  const { toast } = useToast();

  const createInvite = useMutation({
    mutationFn: (payload) => {
      return entities.create('Invite', { 
        family_id: family.id, 
        ...payload 
      });
    },
    onSuccess: (data) => {
      setCreated(data);
      toast({
        title: "הזמנה נוצרה!",
        description: "הקישור להצטרפות הועתק ללוח.",
      });
      const inviteUrl = `${window.location.origin}/join?token=${data.token}`;
      navigator.clipboard.writeText(inviteUrl);
    },
    onError: (error) => {
       toast({
        title: "שגיאה ביצירת הזמנה",
        description: error.message || "נסה שוב מאוחר יותר.",
        variant: "destructive",
      });
    }
  });

  const handleCreateInvite = (role) => {
    createInvite.mutate({ role });
  };
  
  const copyToClipboard = () => {
    if (!created) return;
    const inviteUrl = `${window.location.origin}/join?token=${created.token}`;
    navigator.clipboard.writeText(inviteUrl);
    toast({ description: "הקישור הועתק." });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <h1 className="text-2xl font-bold">ניהול הזמנות</h1>
      <Card>
        <CardHeader>
          <CardTitle>יצירת הזמנה חדשה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            בחר את התפקיד עבור החבר החדש במשפחה. לאחר היצירה, יווצר קישור ייחודי להצטרפות.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button 
              onClick={() => handleCreateInvite('parent')} 
              disabled={createInvite.isLoading}
            >
              {createInvite.isLoading && createInvite.variables?.role === 'parent' ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              צור הזמנה להורה
            </Button>
            <Button 
              onClick={() => handleCreateInvite('child')} 
              disabled={createInvite.isLoading}
            >
              {createInvite.isLoading && createInvite.variables?.role === 'child' ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              צור הזמנה לילד/ה
            </Button>
            <Button 
              onClick={() => handleCreateInvite('grandparent')} 
              disabled={createInvite.isLoading}
            >
              {createInvite.isLoading && createInvite.variables?.role === 'grandparent' ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : null}
              צור הזמנה לסבא/סבתא
            </Button>
          </div>
          {created && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold text-sm">קישור הזמנה נוצר:</p>
              <div className="flex items-center gap-2 mt-2">
                <code className="text-sm bg-gray-200 p-2 rounded flex-grow break-all">
                  {`${window.location.origin}/join?token=${created.token}`}
                </code>
                <Button variant="ghost" size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}