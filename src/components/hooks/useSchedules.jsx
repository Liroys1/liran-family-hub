import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Schedule, Subject, Teacher, TeacherAssignment } from '@/api/entities';

const queryKey = (familyId) => ['schedules', familyId];

export const useSchedulesData = (familyId) => {
  return useQuery({
    queryKey: queryKey(familyId),
    queryFn: async () => {
      if (!familyId) return { schedules: [], subjects: [], teachers: [], assignments: [] };
      
      const [schedules, subjects, teachers, assignments] = await Promise.all([
        Schedule.filter({ family_id: familyId }),
        Subject.filter({ family_id: familyId }),
        Teacher.filter({ family_id: familyId }),
        TeacherAssignment.filter({ family_id: familyId })
      ]);
      
      return { 
        schedules: schedules || [], 
        subjects: subjects || [], 
        teachers: teachers || [], 
        assignments: assignments || [] 
      };
    },
    enabled: !!familyId,
    staleTime: 5 * 60 * 1000,
  });
};

export const useMutateSchedule = (familyId) => {
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (scheduleData) => Schedule.create(scheduleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(familyId) });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }) => Schedule.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(familyId) });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (scheduleData) => Schedule.delete(scheduleData.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey(familyId) });
    },
  });
  
  return { createMutation, updateMutation, deleteMutation };
};