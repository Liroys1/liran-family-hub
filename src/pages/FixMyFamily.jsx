/**
 * FixMyFamily.jsx - כלי עזר מוסתר לסופר-אדמין
 * מאפשר לשייך את המשתמש הנוכחי למשפחה קיימת באמצעות קוד הזמנה.
 */
import React, { useState } from 'react';
import { entities } from '@/components/lib/base44';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function FixMyFamily() {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function attachToFamily() {
    if (!inviteCode.trim()) {
      setMessage('אנא הכנס קוד הזמנה.');
      return;
    }
    setIsLoading(true);
    setMessage('');
    try {
      const fam = (await entities.list('Family', { invite_code: inviteCode.trim() }))?.[0];
      if (!fam) {
        setMessage('קוד הזמנה לא נמצא.');
        setIsLoading(false);
        return;
      }
      await entities.update('User', 'me', { family_id: fam.id, family_role: 'parent' });
      setMessage('שויכת בהצלחה! מרענן את העמוד...');
      setTimeout(() => location.assign('/dashboard'), 2000);
    } catch (error) {
      setMessage('אירעה שגיאה. בדוק את הקונסול.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-6" dir="rtl">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>כלי תיקון: שיוך למשפחה</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            כלי זה מיועד למפתחים בלבד. אם המשתמש שלך "נותק" ממשפחה, תוכל להשתמש בכלי זה כדי לשייך אותו מחדש באמצעות קוד הזמנה.
          </p>
          <div className="flex gap-2">
            <Input 
              placeholder="הכנס קוד הזמנה"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={attachToFamily} disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin ml-2 h-4 w-4" />}
              שייך אותי
            </Button>
          </div>
          {message && <p className="text-sm font-medium">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}