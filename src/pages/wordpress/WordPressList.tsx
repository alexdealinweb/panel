import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useWordPressInstalls, useUpdateWordPress, useToggleWpDebug, useWordPressPlugins } from '@/api/hooks/useWordPress'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { FileCode, RefreshCw, Bug, ExternalLink } from 'lucide-react'

function PluginPanel({ websiteId, wpId }: { websiteId: string; wpId: string }) {
  const { data, isLoading } = useWordPressPlugins(websiteId, wpId)
  const plugins = data?.items || []

  if (isLoading) return <Skeleton className="h-32 w-full" />
  if (plugins.length === 0) return <p className="text-sm text-muted-foreground">No plugins installed.</p>

  return (
    <Table>
      <TableHeader><TableRow><TableHead>Plugin</TableHead><TableHead>Version</TableHead><TableHead>Status</TableHead><TableHead>Update</TableHead></TableRow></TableHeader>
      <TableBody>
        {plugins.map((p) => (
          <TableRow key={p.name}>
            <TableCell className="font-medium">{p.name}</TableCell>
            <TableCell className="text-muted-foreground">{p.version || '-'}</TableCell>
            <TableCell><Badge variant={p.status === 'active' ? 'success' : 'secondary'}>{p.status || '-'}</Badge></TableCell>
            <TableCell>{p.updateAvailable ? <Badge variant="warning">v{p.updateAvailable}</Badge> : <span className="text-muted-foreground">-</span>}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function WordPressList() {
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''
  const { data, isLoading } = useWordPressInstalls(websiteId)
  const updateMutation = useUpdateWordPress(websiteId)
  const debugMutation = useToggleWpDebug(websiteId)
  const [expandedWp, setExpandedWp] = useState<string | null>(null)

  const installs = data?.items || []

  if (!websiteId) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold tracking-tight">WordPress</h1></div>
        <EmptyState icon={FileCode} title="Select a website" description="Navigate to a website first." action={<Link to="/websites"><Button>Go to Websites</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">WordPress Toolkit</h1>
        <p className="text-muted-foreground">Manage WordPress installations.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">{[1, 2].map((i) => <Skeleton key={i} className="h-40 w-full" />)}</div>
      ) : installs.length === 0 ? (
        <EmptyState icon={FileCode} title="No WordPress installs" description="This website has no WordPress installations." />
      ) : (
        <div className="space-y-4">
          {installs.map((wp) => (
            <Card key={wp.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileCode className="h-4 w-4" />
                    WordPress {wp.version || ''}
                    <span className="text-sm text-muted-foreground font-normal">({wp.path || '/'})</span>
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {wp.updateAvailable && (
                      <Button size="sm" onClick={() => updateMutation.mutate(wp.id)} disabled={updateMutation.isPending}>
                        <RefreshCw className="h-3 w-3" /> Update to {wp.updateAvailable}
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={wp.debugMode ? 'destructive' : 'outline'}
                      onClick={() => debugMutation.mutate({ wpId: wp.id, debugMode: !wp.debugMode })}
                    >
                      <Bug className="h-3 w-3" /> Debug {wp.debugMode ? 'ON' : 'OFF'}
                    </Button>
                    {wp.adminUrl && (
                      <Button size="sm" variant="outline" onClick={() => window.open(wp.adminUrl, '_blank')}>
                        <ExternalLink className="h-3 w-3" /> Admin
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <Badge variant={wp.updateAvailable ? 'warning' : 'success'}>
                    {wp.updateAvailable ? 'Update available' : 'Up to date'}
                  </Badge>
                  <span className="text-muted-foreground">Version: {wp.version || 'Unknown'}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setExpandedWp(expandedWp === wp.id ? null : wp.id)}>
                  {expandedWp === wp.id ? 'Hide Plugins' : 'Show Plugins'}
                </Button>
                {expandedWp === wp.id && (
                  <div className="mt-4">
                    <PluginPanel websiteId={websiteId} wpId={wp.id} />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
