/**
 * DebugOverlay.jsx - שכבת דיבוג קבועה בתחתית המסך (במצב Preview)
 * מציגה מידע חיוני על מצב המשתמש, המשפחה, והנתיב הנוכחי
 */
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { User } from '@/api/entities';

export default function DebugOverlay() {
  const loc = useLocation();
  
  // שאילתה ייעודית לדיבוג שלא מתערבת ב-cache הרגיל
  const meQ = useQuery({ 
    queryKey:['__debug_me'], 
    queryFn:()=> User.me(), 
    staleTime: 10_000, 
    retry: 0 
  });
  
  const me = meQ.data;

  const overlayStyle = {
    position:'fixed', bottom:8, left:8, zIndex:9999, // Changed to left for RTL layout
    background:'rgba(0,0,0,.7)', color:'#fff', padding:'8px 12px',
    fontSize:12, borderRadius:8, lineHeight:1.5, maxWidth:360,
    fontFamily: 'monospace', direction: 'ltr', textAlign: 'left' // Ensure LTR for debug
  };

  return (
    <div style={overlayStyle}>
      <div>path: <b>{loc.pathname}</b></div>
      <div>email: <b>{me?.email ?? '—'}</b></div>
      <div>role: <b>{me?.family_role ?? '—'}</b></div>
      <div>family_id: <b>{me?.family_id ?? '—'}</b></div>
      <div>member_id: <b>{me?.member_id ?? '—'}</b></div>
      {meQ.isError && <div style={{color:'#ffb4b4', fontWeight:'bold'}}>User.me failed (check console)</div>}
    </div>
  );
}