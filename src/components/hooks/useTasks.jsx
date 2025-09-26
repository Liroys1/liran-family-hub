
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Task, TaskOccurrence, CompletedTask } from '@/api/entities';
import { queryKeys } from '@/components/constants/queryKeys';
import { useFamilyContext } from '@/components/context/FamilyContext';

export const useTasks = (familyId, params = {}) => {
  const { member } = useFamilyContext();
  const memberId = member?.id;
  const { 
    childId, 
    status, 
    from, 
    to, 
    activeOnly = true, 
    kind,
    visibilityScope,
    ownerOnly = false,
    limit = 50, 
    offset = 0 
  } = params;
  
  return useQuery({
    queryKey: queryKeys.tasks(familyId, params),
    queryFn: async () => {
      if (!familyId) return [];
      
      let filters = { family_id: familyId };
      
      // Basic filters
      if (activeOnly) {
        filters.archived_at = null;
      }
      
      if (status) {
        filters.status = status;
      }
      
      if (kind) {
        filters.kind = kind;
      }
      
      if (visibilityScope) {
        filters.visibility_scope = visibilityScope;
      }
      
      // Owner-only filter for current user (use optional chaining)
      if (ownerOnly && memberId) {
        filters.owner_member_id = memberId;
      }
      
      if (childId) {
        filters.child_id = childId;
      }
      
      // Date range filters
      if (from) {
        filters.due_date_gte = from;
      }
      
      if (to) {
        filters.due_date_lte = to;
      }
      
      return await Task.filter(filters, '-created_date', limit);
    },
    enabled: !!familyId,
    staleTime: 60 * 1000, // Tasks change frequently - 1 minute
    select: (data) => (data || []).sort((a, b) => (a.due_date || '').localeCompare(b.due_date || '')),
  });
};

// Specific hooks for different task views
export const useMyHouseTasks = (familyId) => {
  return useTasks(familyId, {
    kind: 'house_fixed',
    ownerOnly: true,
    activeOnly: true
  });
};

export const useVariableHouseTasks = (familyId) => {
  return useTasks(familyId, {
    kind: 'house_variable',
    activeOnly: true
  });
};

export const useChildHomework = (familyId, childId) => {
  return useTasks(familyId, {
    kind: 'child_homework',
    childId: childId,
    activeOnly: true
  });
};

export const useAllVisibleTasks = (familyId) => {
  return useTasks(familyId, {
    activeOnly: true
  });
};

// Task occurrences for recurring tasks
export const useTaskOccurrences = (familyId, params = {}) => {
  const { taskId, from, to, status } = params;
  
  return useQuery({
    queryKey: queryKeys.taskOccurrences(familyId, params),
    queryFn: async () => {
      if (!familyId) return [];
      
      let filters = { family_id: familyId };
      
      if (taskId) {
        filters.task_id = taskId;
      }
      
      if (from) {
        filters.date_gte = from;
      }
      
      if (to) {
        filters.date_lte = to;
      }
      
      if (status) {
        filters.status = status;
      }
      
      return await TaskOccurrence.filter(filters, 'date');
    },
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations remain the same but updated for new fields
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (taskData) => Task.create(taskData),
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks(newTask.family_id) 
      });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...data }) => Task.update(id, data),
    onSuccess: (updatedTask) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks(updatedTask.family_id) 
      });
    },
  });
};

export const useCompleteTask = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload) => CompletedTask.create({
      ...payload,
      completion_date: new Date().toISOString()
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks(variables.family_id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.completedTasks(variables.family_id) 
      });
    },
  });
};

// Complete a task occurrence
export const useCompleteTaskOccurrence = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ occurrenceId, memberId }) => TaskOccurrence.update(occurrenceId, {
      status: 'done',
      completed_by_member_id: memberId,
      completed_at: new Date().toISOString()
    }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.taskOccurrences() 
      });
    },
  });
};
