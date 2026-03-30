import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWebsites, useDeleteWebsite } from '@/api/hooks/useWebsites'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Plus, MoreVertical, MonitorSmartphone, ExternalLink, Trash2, Search } from 'lucide-react'

export function WebsiteList() {
  const { data, isLoading } = useWebsites()
  const deleteMutation = useDeleteWebsite()
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; domain: string } | null>(null)

  const websites = data?.items || []
  const filtered = websites.filter((w) =>
    w.domain?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Websites</h1>
          <p className="text-muted-foreground">Manage your hosted websites.</p>
        </div>
        <Link to="/websites/create">
          <Button>
            <Plus className="h-4 w-4" />
            Create Website
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search websites..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={MonitorSmartphone}
          title={search ? 'No results' : 'No websites yet'}
          description={search ? 'Try a different search term.' : 'Create your first website to get started.'}
          action={
            !search && (
              <Link to="/websites/create">
                <Button><Plus className="h-4 w-4" /> Create Website</Button>
              </Link>
            )
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>PHP</TableHead>
              <TableHead>Server</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((site) => (
              <TableRow key={site.id}>
                <TableCell>
                  <Link to={`/websites/${site.id}`} className="font-medium hover:underline">
                    {site.domain}
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={site.status === 'active' ? 'success' : site.suspendedAt ? 'destructive' : 'secondary'}>
                    {site.suspendedAt ? 'Suspended' : site.status || 'Active'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{site.phpVersion || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{site.serverIp || site.appServerId || '-'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <MoreVertical className="h-4 w-4 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => window.open(`https://${site.domain}`, '_blank')}>
                        <ExternalLink className="h-4 w-4 mr-2" /> Visit Site
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        variant="destructive"
                        onClick={() => setDeleteTarget({ id: site.id, domain: site.domain })}
                      >
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete Website"
        description={`Are you sure you want to delete "${deleteTarget?.domain}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) deleteMutation.mutate(deleteTarget.id)
        }}
        loading={deleteMutation.isPending}
      />
    </div>
  )
}
