import React from 'react';
import { goBackFallback } from '@/components/router/previewRouter';

export default function BackButton({ fallback = '/boot' }) {
  return (
    <button onClick={() => goBackFallback(fallback)} className="px-3 py-1 rounded-xl border hover:bg-gray-50">
      ← חזרה
    </button>
  );
}