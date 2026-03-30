import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { domains, dns } from '../enhance/endpoints'
import type { DnsRecordCreate } from '../enhance/types'
import { toast } from 'sonner'

export function useDomains(websiteId: string) {
  return useQuery({
    queryKey: ['domains', websiteId],
    queryFn: () => domains.list(websiteId),
    staleTime: 30_000,
    enabled: !!websiteId,
  })
}

export function useCreateDomain(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { domain: string }) => domains.create(websiteId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains', websiteId] })
      toast.success('Domain added')
    },
    onError: (e: Error) => toast.error(`Failed to add domain: ${e.message}`),
  })
}

export function useDeleteDomain(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (domainId: string) => domains.delete(websiteId, domainId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['domains', websiteId] })
      toast.success('Domain removed')
    },
    onError: (e: Error) => toast.error(`Failed to remove domain: ${e.message}`),
  })
}

export function useDnsRecords(websiteId: string, domainId: string) {
  return useQuery({
    queryKey: ['dns', websiteId, domainId],
    queryFn: () => dns.list(websiteId, domainId),
    staleTime: 30_000,
    enabled: !!websiteId && !!domainId,
  })
}

export function useCreateDnsRecord(websiteId: string, domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DnsRecordCreate) => dns.create(websiteId, domainId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dns', websiteId, domainId] })
      toast.success('DNS record created')
    },
    onError: (e: Error) => toast.error(`Failed to create DNS record: ${e.message}`),
  })
}

export function useUpdateDnsRecord(websiteId: string, domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ recordId, data }: { recordId: string; data: Partial<DnsRecordCreate> }) =>
      dns.update(websiteId, domainId, recordId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dns', websiteId, domainId] })
      toast.success('DNS record updated')
    },
    onError: (e: Error) => toast.error(`Failed to update DNS record: ${e.message}`),
  })
}

export function useDeleteDnsRecord(websiteId: string, domainId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (recordId: string) => dns.delete(websiteId, domainId, recordId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['dns', websiteId, domainId] })
      toast.success('DNS record deleted')
    },
    onError: (e: Error) => toast.error(`Failed to delete DNS record: ${e.message}`),
  })
}
