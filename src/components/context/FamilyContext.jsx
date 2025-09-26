/**
 * Family Context - קונטקסט מרכזי לנתוני משפחה
 * מספק גישה לנתוני משתמש, משפחה, וחבר משפחה בכל האפליקציה
 */
import { createContext, useContext } from 'react';

/**
 * הגדרת הקונטקסט עם ערך התחלתי null
 * יכיל: { user: CurrentUser, family?: Family, member?: Member }
 */
export const FamilyContext = createContext(null);

/**
 * Provider component - עוטף חלקי אפליקציה שצריכים גישה לנתוני משפחה
 * @param {ReactNode} children - רכיבי הילדים
 * @param {object} value - ערכי הקונטקסט (user, family, member)
 */
export const FamilyProvider = ({ children, value }) => {
  return (
    <FamilyContext.Provider value={value}>
      {children}
    </FamilyContext.Provider>
  );
};

/**
 * Hook לצריכת נתוני הקונטקסט
 * זורק שגיאה אם נקרא מחוץ ל-FamilyProvider
 * @returns {object} נתוני הקונטקסט { user, family, member }
 */
export const useFamilyContext = () => {
  const context = useContext(FamilyContext);
  if (!context) {
    throw new Error('useFamilyContext must be used within a FamilyProvider');
  }
  return context;
};
