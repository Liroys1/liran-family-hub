/**
 * RoleGuard.jsx - מגן על דפים לפי תפקידי משתמשים
 * מונע גישה לדפים שדורשים הרשאות מסוימות
 */
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFamilyContext } from '@/components/context/FamilyContext';

export default function RoleGuard({
  allow, 
  children,
}) {
  const { user } = useFamilyContext();
  
  // קביעת התפקיד - ברירת מחדל הורה
  const role = (user.family_role || 'parent');
  
  // בדיקת הרשאה
  if (!allow.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
}