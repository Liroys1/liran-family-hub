import React from 'react';
import { AutoFamilyProvider } from '@/components/AutoFamilyProvider';
import CalendarContent from './CalendarContent';

// Wrapper with AutoFamilyProvider
export default function Calendar() {
    return (
        <AutoFamilyProvider>
            <CalendarContent />
        </AutoFamilyProvider>
    );
}