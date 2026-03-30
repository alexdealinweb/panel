import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { backups } from '../enhance/endpoints'
import { toast } from 'sonner'

export function useBackups(websiteId: string) {
  return useQuery({
    queryKey: ['backups', websiteId],
    queryFn: () => backups.list(websiteId),
    staleTime: 30_000,
    enabled: !!websiteId,
  })
}

export function useCreateBackup(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => backups.create(websiteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['backups', websiteId] })
      toast.success('Backup started')
    },
    onError: (e: Error) => toast.error(`Failed to start backup: ${e.message}`),
  })
}

export function useRestoreBackup(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (backupId: string) => backups.restore(websiteId, backupId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['backups', websiteId] })
      toast.success('Backup restore started')
    },
    onError: (e: Error) => toast.error(`Failed to restore backup: ${e.message}`),
  })
}
