/**
 * SwitchFamily.jsx - דף להחלפת משפחה (עבור סופר-אדמינים)
 * מאפשר למנהלי מערכת לעבור בין משפחות שונות לצורכי תמיכה וניהול.
 */
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { entities } from '@/components/lib/base44';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Users } from 'lucide-react';

export default function SwitchFamily() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  const { data: families, isLoading } = useQuery({
    queryKey: ['allFamiliesList'],
    queryFn: () => entities.list('Family', { limit: 500, fields: ['id', 'name'] }),
    staleTime: 5 * 60 * 1000 // 5 דקות
  });

  const filteredFamilies = (families || []).filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectFamily = (familyId) => {
    // מנווט לדשבורד עם ה-familyId החדש ב-state
    navigate(createPageUrl('Dashboard'), { state: { familyId } });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6" dir="rtl">
      <h1 className="text-3xl font-bold">החלפת משפחה</h1>
      <p className="text-gray-600">דף זה מיועד למנהלי מערכת בלבד.</p>
      
      <Card>
        <CardHeader>
          <CardTitle>בחר משפחה</CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="חפש משפחה לפי שם..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />

          {isLoading ? (
            <div className="flex justify-center items-center p-6">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredFamilies.map(family => (
                <Button
                  key={family.id}
                  variant="ghost"
                  className="w-full flex justify-between items-center p-4 h-auto"
                  onClick={() => handleSelectFamily(family.id)}
                >
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span className="font-semibold">{family.name}</span>
                  </div>
                  <span className="text-xs text-gray-400">ID: {family.id}</span>
                </Button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}