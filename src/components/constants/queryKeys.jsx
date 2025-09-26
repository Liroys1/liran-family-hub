
// Centralized Query Keys for consistent caching
export const queryKeys = {
  // Family & Members
  family: (id) => ['family', id],
  members: (familyId, filters = {}) => ['members', familyId, filters],
  member: (id) => ['member', id],
  currentUser: () => ['currentUser'],
  
  // Children
  children: (familyId, filters = {}) => ['children', familyId, filters],
  child: (id) => ['child', id],
  childrenWithMembers: (familyId, filters = {}) => ['childrenWithMembers', familyId, filters],
  
  // Tasks
  tasks: (familyId, params = {}) => ['tasks', familyId, params],
  completedTasks: (familyId, params = {}) => ['completedTasks', familyId, params],
  
  // Events & Calendar
  events: (familyId, range, filters = {}) => ['events', familyId, range, filters],
  
  // Activities
  activities: (familyId, params = {}) => ['activities', familyId, params],
  
  // Schedule & School
  schedules: (familyId, params = {}) => ['schedules', familyId, params],
  subjects: (familyId) => ['subjects', familyId],
  teachers: (familyId) => ['teachers', familyId],
  teacherAssignments: (familyId) => ['teacherAssignments', familyId],
  classContacts: (familyId, filters = {}) => ['classContacts', familyId, filters],
  
  // Custody
  custodyTemplate: (familyId) => ['custodyTemplate', familyId],
  custodyOverrides: (familyId, range = {}) => ['custodyOverrides', familyId, range],
  
  // System
  auditLog: (familyId, params = {}) => ['auditLog', familyId, params],
  holidays: (familyId) => ['holidays', familyId],
  notifications: (familyId, memberId) => ['notifications', familyId, memberId],
  notificationPreferences: (familyId, memberId) => ['notificationPreferences', familyId, memberId],
  
  // Summary/Dashboard
  familySummary: (familyId, range = {}) => ['familySummary', familyId, range],
};
