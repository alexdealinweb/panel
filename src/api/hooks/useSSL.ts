import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ssl } from '../enhance/endpoints'
import type { SslCertUpload } from '../enhance/types'
import { toast } from 'sonner'

export function useSslCerts(websiteId: string) {
  return useQuery({
    queryKey: ['ssl', websiteId],
    queryFn: () => ssl.list(websiteId),
    staleTime: 30_000,
    enabled: !!websiteId,
  })
}

export function useIssueSsl(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (domainId: string) => ssl.issue(websiteId, domainId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ssl', websiteId] })
      toast.success('SSL certificate issued')
    },
    onError: (e: Error) => toast.error(`Failed to issue SSL: ${e.message}`),
  })
}

export function useUploadSsl(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: SslCertUpload) => ssl.upload(websiteId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ssl', websiteId] })
      toast.success('SSL certificate uploaded')
    },
    onError: (e: Error) => toast.error(`Failed to upload SSL: ${e.message}`),
  })
}

export function useDeleteSsl(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (sslId: string) => ssl.delete(websiteId, sslId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['ssl', websiteId] })
      toast.success('SSL certificate deleted')
    },
    onError: (e: Error) => toast.error(`Failed to delete SSL: ${e.message}`),
  })
}
