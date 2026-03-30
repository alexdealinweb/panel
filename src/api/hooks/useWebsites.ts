import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { websites } from '../enhance/endpoints'
import type { WebsiteCreate } from '../enhance/types'
import { toast } from 'sonner'

export function useWebsites() {
  return useQuery({
    queryKey: ['websites'],
    queryFn: () => websites.list(),
    staleTime: 30_000,
  })
}

export function useWebsite(websiteId: string) {
  return useQuery({
    queryKey: ['websites', websiteId],
    queryFn: () => websites.get(websiteId),
    staleTime: 30_000,
    enabled: !!websiteId,
  })
}

export function useCreateWebsite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: WebsiteCreate) => websites.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['websites'] })
      toast.success('Website created')
    },
    onError: (e: Error) => toast.error(`Failed to create website: ${e.message}`),
  })
}

export function useDeleteWebsite() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (websiteId: string) => websites.delete(websiteId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['websites'] })
      toast.success('Website deleted')
    },
    onError: (e: Error) => toast.error(`Failed to delete website: ${e.message}`),
  })
}
