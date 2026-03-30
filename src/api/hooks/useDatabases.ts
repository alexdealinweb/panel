import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { databases } from '../enhance/endpoints'
import type { DatabaseCreate } from '../enhance/types'
import { toast } from 'sonner'

export function useDatabases(websiteId: string) {
  return useQuery({
    queryKey: ['databases', websiteId],
    queryFn: () => databases.list(websiteId),
    staleTime: 30_000,
    enabled: !!websiteId,
  })
}

export function useCreateDatabase(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: DatabaseCreate) => databases.create(websiteId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['databases', websiteId] })
      toast.success('Database created')
    },
    onError: (e: Error) => toast.error(`Failed to create database: ${e.message}`),
  })
}

export function useDeleteDatabase(websiteId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (dbId: string) => databases.delete(websiteId, dbId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['databases', websiteId] })
      toast.success('Database deleted')
    },
    onError: (e: Error) => toast.error(`Failed to delete database: ${e.message}`),
  })
}

export function usePhpMyAdminSso(websiteId: string) {
  return useMutation({
    mutationFn: (dbId: string) => databases.getSsoUrl(websiteId, dbId),
    onSuccess: (data) => {
      if (data.url) window.open(data.url, '_blank')
    },
    onError: (e: Error) => toast.error(`Failed to open phpMyAdmin: ${e.message}`),
  })
}
