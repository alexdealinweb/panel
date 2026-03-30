import { useQuery } from '@tanstack/react-query'
import { servers } from '../enhance/endpoints'

export function useServers() {
  return useQuery({
    queryKey: ['servers'],
    queryFn: () => servers.list(),
    staleTime: 30_000,
  })
}

export function useServer(serverId: string) {
  return useQuery({
    queryKey: ['servers', serverId],
    queryFn: () => servers.get(serverId),
    staleTime: 30_000,
    enabled: !!serverId,
  })
}

export function useServerStatus(serverId: string) {
  return useQuery({
    queryKey: ['server-status', serverId],
    queryFn: () => servers.getStatus(serverId),
    staleTime: 15_000,
    refetchInterval: 30_000,
    enabled: !!serverId,
  })
}
