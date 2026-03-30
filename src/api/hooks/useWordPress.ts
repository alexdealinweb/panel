import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { wordpress } from '../enhance/endpoints'
import { toast } from 'sonner'

export function useWordPressInstalls(websiteId: string) {
  return useQuery({
    queryKey: ['wordpress', websiteId],
    queryFn: () => wordpress.list(websiteId),
    staleTime: 30_000,
    enabled: !!websiteId,
  })
}

export function useInstallWordPress(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => wordpress.install(websiteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wordpress', websiteId] })
      toast.success('WordPress installed')
    },
    onError: (e: Error) => toast.error(`Failed to install WordPress: ${e.message}`),
  })
}

export function useUpdateWordPress(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (wpId: string) => wordpress.update(websiteId, wpId, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wordpress', websiteId] })
      toast.success('WordPress updated')
    },
    onError: (e: Error) => toast.error(`Failed to update WordPress: ${e.message}`),
  })
}

export function useWordPressPlugins(websiteId: string, wpId: string) {
  return useQuery({
    queryKey: ['wp-plugins', websiteId, wpId],
    queryFn: () => wordpress.listPlugins(websiteId, wpId),
    staleTime: 30_000,
    enabled: !!websiteId && !!wpId,
  })
}

export function useToggleWpDebug(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ wpId, debugMode }: { wpId: string; debugMode: boolean }) =>
      wordpress.update(websiteId, wpId, { debugMode }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['wordpress', websiteId] })
      toast.success('Debug mode toggled')
    },
    onError: (e: Error) => toast.error(`Failed to toggle debug: ${e.message}`),
  })
}
