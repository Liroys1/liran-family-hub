import { createContext, useContext } from 'react';

const defaultValue = { user: null, family: null, loading: true };
export const FamilyContext = createContext(defaultValue);

export function useFamilyContext() {
  // לא זורקים שגיאה; מחזירים מצב בטוח
  return useContext(FamilyContext) || defaultValue;
}