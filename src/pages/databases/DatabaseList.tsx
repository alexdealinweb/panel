import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useDatabases, useDeleteDatabase, usePhpMyAdminSso } from '@/api/hooks/useDatabases'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { Database, Plus, MoreVertical, ExternalLink, Trash2 } from 'lucide-react'

export function DatabaseList() {
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''
  const { data, isLoading } = useDatabases(websiteId)
  const deleteMutation = useDeleteDatabase(websiteId)
  const ssoMutation = usePhpMyAdminSso(websiteId)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const dbs = data?.items || []

  if (!websiteId) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold tracking-tight">Databases</h1><p className="text-muted-foreground">Manage MySQL databases.</p></div>
        <EmptyState icon={Database} title="Select a website" description="Navigate to a website first, then manage its databases." action={<Link to="/websites"><Button>Go to Websites</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Databases</h1><p className="text-muted-foreground">Manage MySQL databases.</p></div>
        <Link to={`/databases/create?websiteId=${websiteId}`}><Button><Plus className="h-4 w-4" /> Create Database</Button></Link>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : dbs.length === 0 ? (
        <EmptyState icon={Database} title="No databases" description="Create your first MySQL database." action={<Link to={`/databases/create?websiteId=${websiteId}`}><Button><Plus className="h-4 w-4" /> Create Database</Button></Link>} />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Size</TableHead><TableHead>Charset</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
          <TableBody>
            {dbs.map((db) => (
              <TableRow key={db.id}>
                <TableCell className="font-medium font-mono">{db.name}</TableCell>
                <TableCell className="text-muted-foreground">{db.size ? `${(db.size / 1024 / 1024).toFixed(1)} MB` : '-'}</TableCell>
                <TableCell className="text-muted-foreground">{db.charset || 'utf8mb4'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger><MoreVertical className="h-4 w-4 text-muted-foreground" /></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => ssoMutation.mutate(db.id)}>
                        <ExternalLink className="h-4 w-4 mr-2" /> phpMyAdmin
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteTarget({ id: db.id, name: db.name })}>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Database" description={`Are you sure you want to delete "${deleteTarget?.name}"? All data will be lost.`} confirmLabel="Delete" variant="destructive" onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id) }} />
    </div>
  )
}
