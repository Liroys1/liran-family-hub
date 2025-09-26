
/**
 * registry.js - רישום כל הווידג'טים הזמינים לדשבורד
 * מפה שם ווידג'ט לקומפוננטה המתאימה
 */
import React from 'react';

// Import all available dashboard widgets
import CountsCard from './CountsCard';
import NextEventsList from './NextEventsList';
import TodayTasksList from './TodayTasksList';

/**
 * רישום בשם → קומפוננטת רנדר
 * כל ווידג'ט חדש צריך להיות רשום כאן
 */
export const WidgetRegistry = {
  CountsCard: (props) => <CountsCard {...props} />,
  NextEventsList: (props) => <NextEventsList {...props} />,
  TodayTasksList: (props) => <TodayTasksList {...props} />,
};

/**
 * רשימת כל הווידג'טים הזמינים לבחירה במערכת הניהול
 */
export const AVAILABLE_WIDGETS = [
  {
    type: 'CountsCard',
    displayName: 'כרטיס מונים',
    description: 'מציג מונים בסיסיים (ילדים, משימות פתוחות, etc.)',
    suitableFor: ['parent', 'grandparent']
  },
  {
    type: 'TodayTasksList',
    displayName: 'משימות היום',
    description: 'רשימת המשימות לביצוע היום',
    suitableFor: ['parent', 'child', 'grandparent']
  },
  {
    type: 'NextEventsList',
    displayName: 'אירועים קרובים',
    description: 'רשימת האירועים הקרובים במשפחה',
    suitableFor: ['parent', 'child', 'grandparent']
  }
];
