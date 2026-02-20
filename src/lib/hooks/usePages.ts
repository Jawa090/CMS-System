import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Page } from '@/lib/types';

export const usePages = (projectId: string) => {
  return useQuery({
    queryKey: ['pages', projectId],
    queryFn: () => api.get(`/pages/project/${projectId}`),
    enabled: !!projectId,
  });
};

export const usePage = (id: string) => {
  return useQuery({
    queryKey: ['pages', id],
    queryFn: () => api.get(`/pages/${id}`),
    enabled: !!id,
  });
};

export const useUpdatePage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Page> }) =>
      api.put(`/pages/${id}`, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pages', variables.id] });
    },
  });
};
