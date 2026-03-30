import { useWebsites } from '@/api/hooks/useWebsites'
import { useServers } from '@/api/hooks/useServers'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { MonitorSmartphone, Globe, Database, Server, HardDrive } from 'lucide-react'

function StatCard({ title, value, icon: Icon, loading }: {
  title: string
  value: string | number
  icon: React.ElementType
  loading?: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-7 w-20" />
        ) : (
          <div className="text-2xl font-bold">{value}</div>
        )}
      </CardContent>
    </Card>
  )
}

function ServerCard({ server }: { server: { id: string; friendlyName?: string; hostname?: string; roles?: string[] } }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{server.friendlyName || server.hostname || server.id}</span>
          </div>
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-500">
            Online
          </span>
        </div>
        {server.roles && server.roles.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {server.roles.map((role) => (
              <span key={role} className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-xs">
                {role}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function Dashboard() {
  const { data: websitesData, isLoading: websitesLoading } = useWebsites()
  const { data: serversData, isLoading: serversLoading } = useServers()

  const websiteCount = websitesData?.items?.length ?? 0
  const serverCount = serversData?.items?.length ?? 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your hosting infrastructure.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Websites" value={websiteCount} icon={MonitorSmartphone} loading={websitesLoading} />
        <StatCard title="Servers" value={serverCount} icon={Server} loading={serversLoading} />
        <StatCard title="Domains" value="-" icon={Globe} loading={false} />
        <StatCard title="Databases" value="-" icon={Database} loading={false} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Servers</h2>
        {serversLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
            ))}
          </div>
        ) : serversData?.items && serversData.items.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {serversData.items.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <HardDrive className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No servers found. Configure your API connection in Settings.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
