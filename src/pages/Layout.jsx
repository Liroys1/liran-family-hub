// src/pages/Layout.jsx
import { useEffect, useState } from 'react';
import { initRouter, onRouteChange, getRoute } from '../components/lib/router';
import { IS_PREVIEW } from '../components/lib/env';

// Components
import BootGate from './BootGate';
import SuperAdminDashboard from './SuperAdminDashboard';
import Dashboard from './Dashboard';
import Setup from './Setup';
import ChildrenPage from './Children';
import CustodyPage from './Custody';
import HolidaysPage from './Holidays';
import Settings from './Settings';
import AuditLogPage from './AuditLog';
import DashboardLayoutSettings from './DashboardLayoutSettings';
import Invites from './Invites';
import Join from './Join';

function Topbar() {
  return (
    <header className="sticky top-0 z-10 bg-white border-b">
      <div className="max-w-6xl mx-auto p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <button onClick={() => window.history.back()} className="px-2 py-1 rounded border">חזרה</button>
            <div className="font-medium">My Family Hub</div>
        </div>
        {IS_PREVIEW && <div className="text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">Preview Mode</div>}
      </div>
    </header>
  );
}

const routes = {
  '/': BootGate,
  '/boot': BootGate,
  '/super-admin': SuperAdminDashboard,
  '/sa': SuperAdminDashboard,
  '/setup': Setup,
  '/join': Join,
  '/dashboard': Dashboard,
  '/children': ChildrenPage,
  '/custody': CustodyPage,
  '/holidays': HolidaysPage,
  '/settings': Settings,
  '/settings/dashboard': DashboardLayoutSettings,
  '/settings/invites': Invites,
  '/audit-log': AuditLogPage,
};

export default function Layout() {
  const [route, setRoute] = useState(getRoute());

  useEffect(() => {
    initRouter();
    const off = onRouteChange(setRoute);
    return off;
  }, []);

  // נתיב ברירת המחדל הוא BootGate
  const Component = routes[route.path] || BootGate;

  // ה-Layout רק מציג את המסגרת והדף הנכון. הוא לא מבצע בדיקות לוגין או ניתובים.
  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <main className="max-w-6xl mx-auto p-4">
        <Component />
      </main>
    </div>
  );
}