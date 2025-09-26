import { useEffect } from 'react';
import { replace } from '../components/lib/router';

export default function NotFound() {
  useEffect(() => { 
    replace('#/boot'); 
  }, []);
  
  return <div className="p-6 text-center">מעביר…</div>;
}