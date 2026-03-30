import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useBackups, useCreateBackup, useRestoreBackup } from '@/api/hooks/useBackups'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Archive, Plus, RotateCcw } from 'lucide-react'

export function BackupList() {
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''
  const { data, isLoading } = useBackups(websiteId)
  const createMutation = useCreateBackup(websiteId)
  const restoreMutation = useRestoreBackup(websiteId)
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null)

  const backupItems = data?.items || []

  if (!websiteId) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold tracking-tight">Backups</h1></div>
        <EmptyState icon={Archive} title="Select a website" description="Navigate to a website first." action={<Link to="/websites"><Button>Go to Websites</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Backups</h1><p className="text-muted-foreground">Manage website backups.</p></div>
        <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Plus className="h-4 w-4" /> {createMutation.isPending ? 'Creating...' : 'New Backup'}
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : backupItems.length === 0 ? (
        <EmptyState icon={Archive} title="No backups" description="Create your first backup." action={<Button onClick={() => createMutation.mutate()}><Plus className="h-4 w-4" /> New Backup</Button>} />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Type</TableHead><TableHead>Status</TableHead><TableHead>Size</TableHead><TableHead className="w-20" /></TableRow></TableHeader>
          <TableBody>
            {backupItems.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.startedAt ? new Date(b.startedAt).toLocaleString() : '-'}</TableCell>
                <TableCell className="text-muted-foreground">{b.kind || 'Full'}</TableCell>
                <TableCell><Badge variant={b.status === 'completed' ? 'success' : b.status === 'failed' ? 'destructive' : 'secondary'}>{b.status || 'Unknown'}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{b.size ? `${(b.size / 1024 / 1024).toFixed(1)} MB` : '-'}</TableCell>
                <TableCell>
                  <Button variant="outline" size="sm" onClick={() => setRestoreTarget(b.id)}>
                    <RotateCcw className="h-3 w-3 mr-1" /> Restore
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <AlertDialog open={!!restoreTarget} onOpenChange={() => setRestoreTarget(null)} title="Restore Backup" description="This will overwrite the current website data. Are you sure?" confirmLabel="Restore" onConfirm={() => { if (restoreTarget) restoreMutation.mutate(restoreTarget) }} loading={restoreMutation.isPending} />
    </div>
  )
}
