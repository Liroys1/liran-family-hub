
import React from 'react';
import {
  Palette, Swords, PersonStanding, Award, User, Waves,
  Guitar, Music, Brush, Brain, Dumbbell, Footprints, Dna, Code, BookCopy, Drama, BrainCircuit
} from 'lucide-react';

const iconMapping = [
  { keywords: ['טניס'], icon: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      <circle cx="12" cy="7" r="1.5"/>
    </svg>
  )},
  { keywords: ['קפוארה', 'ג\'ודו', 'קרב', 'קראטה', 'אומנויות לחימה'], icon: Swords },
  { keywords: ['בלט', 'מחול', 'ריקוד'], icon: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M14,12c0-1.1-0.9-2-2-2s-2,0.9-2,2s0.9,2,2,2S14,13.1,14,12z M12,3C7.58,3,4,6.58,4,11c0,1.61,0.49,3.1,1.32,4.34 C5.83,16.24,6.98,17.27,8.34,17.99C9.98,18.78,11.01,19,12,19s2.02-0.22,3.34-0.67c1.36-0.72,2.51-1.75,3.34-2.99 C19.51,14.1,20,12.61,20,11C20,6.58,16.42,3,12,3z"/>
    </svg>
  )},
  { keywords: ['התעמלות', 'כושר', 'ספורט', 'התעמלות קרקע'], icon: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M13.5,5.5C13.5,4.12,12.38,3,11,3S8.5,4.12,8.5,5.5S9.62,8,11,8S13.5,6.88,13.5,5.5z M20.5,9.5L18.5,8.5l-2.12,4.24 c-0.54,1.08-1.67,1.76-2.88,1.76H12v3.5h7.5c0.83,0,1.5,0.67,1.5,1.5S20.33,21,19.5,21S18,20.33,18,19.5v-0.5H7.5v0.5 C7.5,20.33,6.83,21,6,21S4.5,20.33,4.5,19.5S5.17,18,6,18h1.5v-3.5H6.5c-1.21,0-2.34-0.68-2.88-1.76L1.5,8.5L3.5,9.5l2.12,4.24 H11l-3-6l2-0.5L12.5,12l2.38-4.76L20.5,9.5z"/>
    </svg>
  )},
  { keywords: ['כדורגל'], icon: Award }, // 'טניס' keyword was removed from here as it has its own entry
  { keywords: ['כדורסל'], icon: User },
  { keywords: ['שחיה', 'שחייה'], icon: Waves },
  { keywords: ['גיטרה'], icon: Guitar },
  { keywords: ['מוזיקה', 'פסנתר', 'חליל', 'שירה'], icon: Music },
  { keywords: ['אומנות', 'ציור', 'יצירה'], icon: Brush },
  { keywords: ['שחמט'], icon: Brain },
  { keywords: ['ריצה'], icon: Footprints },
  { keywords: ['מדע'], icon: Dna },
  { keywords: ['תכנות', 'מחשבים', 'בינה מלאכותית', 'ai'], icon: ({ className }) => (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M20,18c1.1,0,2-0.9,2-2V6c0-1.1-0.9-2-2-2H4C2.9,4,2,4.9,2,6v10c0,1.1,0.9,2,2,2H0v2h24v-2H20z M4,6h16v10H4V6z"/>
      <path d="M12,8c-2.21,0-4,1.79-4,4s1.79,4,4,4s4-1.79,4-4S14.21,8,12,8z M12,14c-1.1,0-2-0.9-2-2s0.9-2,2-2s2,0.9,2,2S13.1,14,12,14z"/>
    </svg>
  )},
  { keywords: ['אנגלית', 'עברית', 'שפות'], icon: BookCopy },
  { keywords: ['תיאטרון', 'דרמה'], icon: Drama }
];

export default function ActivityIcon({ activityName, className = "w-5 h-5" }) {
  if (!activityName) {
    return <Palette className={className} />;
  }
  
  const lowerCaseName = activityName.toLowerCase();

  for (const mapping of iconMapping) {
    if (mapping.keywords.some(keyword => lowerCaseName.includes(keyword))) {
      const IconComponent = mapping.icon;
      return <IconComponent className={className} />;
    }
  }

  return <Palette className={className} />;
}
