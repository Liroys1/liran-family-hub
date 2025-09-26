import { push } from '../lib/router';

export default function BackButton({ fallback = '#/boot', className = '' }) {
  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      // אם אחרי 400ms עדיין באותו מסך – ניפול לפאלבק
      setTimeout(() => {
        const h = window.location.hash || '';
        if (!h || h === '#/' || h === '#/boot') push(fallback);
      }, 400);
    } else {
      push(fallback);
    }
  }
  return (
    <button onClick={goBack} className={`px-3 py-1 rounded-xl border ${className}`}>
      ← חזרה
    </button>
  );
}