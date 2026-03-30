import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ftp } from '@/api/enhance/endpoints'
import type { FtpUserCreate } from '@/api/enhance/types'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { FolderUp, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function FtpList() {
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''
  const qc = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['ftp', websiteId],
    queryFn: () => ftp.list(websiteId),
    staleTime: 30_000,
    enabled: !!websiteId,
  })

  const createMutation = useMutation({
    mutationFn: (d: FtpUserCreate) => ftp.create(websiteId, d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ftp', websiteId] }); toast.success('FTP user created') },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => ftp.delete(websiteId, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['ftp', websiteId] }); toast.success('FTP user deleted') },
    onError: (e: Error) => toast.error(e.message),
  })

  const [showAdd, setShowAdd] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)
  const { register, handleSubmit, reset } = useForm<FtpUserCreate>()

  const users = data?.items || []

  if (!websiteId) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold tracking-tight">FTP Accounts</h1></div>
        <EmptyState icon={FolderUp} title="Select a website" description="Navigate to a website first." action={<Link to="/websites"><Button>Go to Websites</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">FTP Accounts</h1><p className="text-muted-foreground">Manage FTP users.</p></div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Create FTP User</Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : users.length === 0 ? (
        <EmptyState icon={FolderUp} title="No FTP accounts" description="Create an FTP account for file access." action={<Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Create FTP User</Button>} />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Username</TableHead><TableHead>Home Directory</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell className="font-medium font-mono">{u.username}</TableCell>
                <TableCell className="text-muted-foreground">{u.homeDir || '/'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ id: u.id, name: u.username })}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create FTP User</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => { createMutation.mutate(d, { onSuccess: () => { setShowAdd(false); reset() } }) })} className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Username</label><Input {...register('username', { required: true })} /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="flex gap-2">
                <Input type={showPassword ? 'text' : 'password'} {...register('password', { required: true })} />
                <Button type="button" variant="outline" onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</Button>
              </div>
            </div>
            <div className="space-y-2"><label className="text-sm font-medium">Home Directory</label><Input placeholder="/" {...register('homeDir')} /></div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete FTP User" description={`Delete "${deleteTarget?.name}"?`} confirmLabel="Delete" variant="destructive" onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget.id) }} />
    </div>
  )
}
