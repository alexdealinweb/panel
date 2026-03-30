import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { email } from '../enhance/endpoints'
import type { MailboxCreate } from '../enhance/types'
import { toast } from 'sonner'

export function useMailboxes(websiteId: string) {
  return useQuery({
    queryKey: ['mailboxes', websiteId],
    queryFn: () => email.listMailboxes(websiteId),
    staleTime: 30_000,
    enabled: !!websiteId,
  })
}

export function useCreateMailbox(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: MailboxCreate) => email.createMailbox(websiteId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mailboxes', websiteId] })
      toast.success('Mailbox created')
    },
    onError: (e: Error) => toast.error(`Failed to create mailbox: ${e.message}`),
  })
}

export function useDeleteMailbox(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (emailId: string) => email.deleteMailbox(websiteId, emailId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['mailboxes', websiteId] })
      toast.success('Mailbox deleted')
    },
    onError: (e: Error) => toast.error(`Failed to delete mailbox: ${e.message}`),
  })
}

export function useForwarders(websiteId: string) {
  return useQuery({
    queryKey: ['forwarders', websiteId],
    queryFn: () => email.listForwarders(websiteId),
    staleTime: 30_000,
    enabled: !!websiteId,
  })
}

export function useCreateForwarder(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: { address: string; forwardTo: string }) => email.createForwarder(websiteId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forwarders', websiteId] })
      toast.success('Forwarder created')
    },
    onError: (e: Error) => toast.error(`Failed to create forwarder: ${e.message}`),
  })
}

export function useDeleteForwarder(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (forwarderId: string) => email.deleteForwarder(websiteId, forwarderId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['forwarders', websiteId] })
      toast.success('Forwarder deleted')
    },
    onError: (e: Error) => toast.error(`Failed to delete forwarder: ${e.message}`),
  })
}
