import { useServers, useServerStatus } from '@/api/hooks/useServers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Server } from 'lucide-react'

function GaugeBar({ label, value, max, unit = '%' }: { label: string; value: number; max: number; unit?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const color = pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-amber-500' : 'bg-emerald-500'
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span>{pct.toFixed(1)}{unit}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function ServerCard({ server }: { server: { id: string; friendlyName?: string; hostname?: string; ip?: string; roles?: string[]; status?: string } }) {
  const { data: status, isLoading } = useServerStatus(server.id)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="h-4 w-4" />
            {server.friendlyName || server.hostname || server.id}
          </CardTitle>
          <Badge variant={server.status === 'offline' ? 'destructive' : 'success'}>
            {server.status || 'Online'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          {server.ip && <span>IP: {server.ip}</span>}
        </div>

        {server.roles && server.roles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {server.roles.map((role) => (
              <Badge key={role} variant="secondary">{role}</Badge>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        ) : status ? (
          <div className="space-y-3">
            <GaugeBar label="CPU" value={status.cpuUsage || 0} max={100} />
            <GaugeBar label="Memory" value={status.memoryUsed || 0} max={status.memoryTotal || 1} unit={`% (${((status.memoryUsed || 0) / 1024 / 1024 / 1024).toFixed(1)} / ${((status.memoryTotal || 0) / 1024 / 1024 / 1024).toFixed(1)} GB)`} />
            <GaugeBar label="Disk" value={status.diskUsed || 0} max={status.diskTotal || 1} unit={`% (${((status.diskUsed || 0) / 1024 / 1024 / 1024).toFixed(1)} / ${((status.diskTotal || 0) / 1024 / 1024 / 1024).toFixed(1)} GB)`} />
            {status.uptime && (
              <div className="text-xs text-muted-foreground">Uptime: {Math.floor(status.uptime / 86400)}d {Math.floor((status.uptime % 86400) / 3600)}h</div>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function ServerOverview() {
  const { data, isLoading } = useServers()
  const serverList = data?.items || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Servers</h1>
        <p className="text-muted-foreground">Monitor your server infrastructure.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Card key={i}><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>)}
        </div>
      ) : serverList.length === 0 ? (
        <EmptyState icon={Server} title="No servers" description="No servers found. Check your API connection." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {serverList.map((s) => <ServerCard key={s.id} server={s} />)}
        </div>
      )}
    </div>
  )
}
