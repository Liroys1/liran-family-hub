import BackButton from '../components/ui/BackButton';
import { push } from '../components/lib/router';

export default function Setup() {
  return (
    <div className="p-4 space-y-4">
      <BackButton />
      <h1 className="text-xl font-semibold">הקמת משפחה / הצטרפות</h1>

      <div className="bg-white rounded-2xl shadow p-4 space-y-3">
        <button onClick={() => push('#/setup/create')} className="px-3 py-2 rounded-xl border w-full hover:bg-gray-50">
          יצירת משפחה חדשה
        </button>
        <button onClick={() => push('#/setup/join')} className="px-3 py-2 rounded-xl border w-full hover:bg-gray-50">
          הצטרפות עם קוד הזמנה / לינק
        </button>
        <button onClick={() => push('#/super-admin')} className="px-3 py-2 rounded-xl border w-full hover:bg-gray-50">
          אני סופר־אדמין (בדיקות)
        </button>
      </div>
    </div>
  );
}