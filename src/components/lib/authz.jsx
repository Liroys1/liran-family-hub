/**
 * מערכת הרשאות - זיהוי סופר אדמין ותפקידים
 */

// רשימת Super Admins (אפשר להרחיב)
const SUPER_ADMINS = new Set(['liroys1@gmail.com']); 

/**
 * בודק האם המייל שייך לסופר אדמין
 * @param {string} email - כתובת המייל לבדיקה
 * @returns {boolean} האם זה סופר אדמין
 */
export const isSuperAdminEmail = (email) => {
  return !!email && SUPER_ADMINS.has(email.toLowerCase());
};

// פונקציית עזר לשמירה על תאימות עם קוד ישן
export const isSuperAdmin = (email) => isSuperAdminEmail(email);

/**
 * בודק האם המשתמש הוא הורה
 * @param {object} user - אובייקט המשתמש
 * @returns {boolean} האם זה הורה
 */
export const isParent = (user) => {
  return user?.family_role === 'parent';
};

/**
 * בודק האם המשתמש הוא ילד
 * @param {object} user - אובייקט המשתמש  
 * @returns {boolean} האם זה ילד
 */
export const isChild = (user) => {
  return user?.family_role === 'child';
};

/**
 * בודק האם המשתמש הוא סבא/סבתא
 * @param {object} user - אובייקט המשתמש
 * @returns {boolean} האם זה סבא/סבתא  
 */
export const isGrandparent = (user) => {
  return user?.family_role === 'grandparent';
};