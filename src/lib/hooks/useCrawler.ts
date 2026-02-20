import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { CrawlJob } from '@/lib/types';

export const useStartCrawl = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: { projectId: string; startUrl: string; maxDepth?: number; maxPages?: number }) =>
      api.post('/crawler/start', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crawl-jobs'] });
    },
  });
};

export const useCrawlStatus = (jobId: string) => {
  return useQuery({
    queryKey: ['crawl-jobs', jobId],
    queryFn: () => api.get(`/crawler/jobs/${jobId}/status`),
    enabled: !!jobId,
    refetchInterval: (data) => {
      // Stop polling if job is completed or failed
      if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
        return false;
      }
      return 2000; // Poll every 2 seconds
    },
  });
};

export const useCrawlJobs = (projectId: string) => {
  return useQuery({
    queryKey: ['crawl-jobs', projectId],
    queryFn: () => api.get(`/crawler/jobs?projectId=${projectId}`),
    enabled: !!projectId,
  });
};
