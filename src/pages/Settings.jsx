/**
 * Settings.jsx - מרכז ההגדרות של המשפחה
 * דף זה מכיל קישורים לדפי הגדרות שונים כמו ניהול משפחה, תצורת דשבורד וניהול הזמנות
 */
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ChevronLeft, Users, LayoutDashboard, Send, ShieldAlert } from 'lucide-react';
import { createPageUrl } from '@/utils';
import DangerZone from './DangerZone';

export default function Settings() {
  const settingsLinks = [
    {
      title: 'ניהול חברי משפחה',
      description: 'הוסף, ערוך או הסר חברי משפחה',
      url: createPageUrl('Children'), // Assuming 'Children' is the member management page
      icon: Users
    },
    {
      title: 'תצורת דשבורד',
      description: 'התאם אישית את הווידג\'טים בדשבורד לכל תפקיד',
      url: createPageUrl('DashboardLayoutSettings'),
      icon: LayoutDashboard
    },
    {
      title: 'ניהול הזמנות',
      description: 'צור ונהל קישורי הצטרפות למשפחה',
      url: createPageUrl('Invites'),
      icon: Send
    },
  ];

  return (
    <div className="space-y-8" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold">הגדרות</h1>
        <p className="text-gray-500">נהל את ההגדרות של משפחתך והחשבון שלך</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {settingsLinks.map((link) => (
          <Link to={link.url} key={link.title}>
            <Card className="hover:bg-gray-50 transition-colors h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <link.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>{link.title}</CardTitle>
                    <CardDescription>{link.description}</CardDescription>
                  </div>
                </div>
                <ChevronLeft className="h-5 w-5 text-gray-400" />
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
      
      <DangerZone />
    </div>
  );
}