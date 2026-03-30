import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { customers, plans } from '@/api/enhance/endpoints'
import type { CustomerCreate } from '@/api/enhance/types'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Select } from '@/components/ui/select'
import { Users, Plus, MoreVertical, Search, UserX, UserCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

export function CustomerList() {
  const qc = useQueryClient()
  const { data, isLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: () => customers.list(),
    staleTime: 30_000,
  })

  const { data: plansData } = useQuery({
    queryKey: ['plans'],
    queryFn: () => plans.list(),
    staleTime: 60_000,
  })

  const createMutation = useMutation({
    mutationFn: (d: CustomerCreate) => customers.create(d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer created') },
    onError: (e: Error) => toast.error(e.message),
  })

  const suspendMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => customers.update(id, { status }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['customers'] }); toast.success('Customer updated') },
    onError: (e: Error) => toast.error(e.message),
  })

  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const { register, handleSubmit, reset } = useForm<CustomerCreate>()

  const customerList = data?.items || []
  const planList = plansData?.items || []
  const filtered = customerList.filter((c) =>
    (c.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.email || '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Customers</h1><p className="text-muted-foreground">Manage customer accounts.</p></div>
        <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Customer</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title={search ? 'No results' : 'No customers'} description={search ? 'Try a different search.' : 'Add your first customer.'} action={!search && <Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Customer</Button>} />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Status</TableHead><TableHead>Websites</TableHead><TableHead>Created</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name || '-'}</TableCell>
                <TableCell><Badge variant={c.status === 'suspended' ? 'destructive' : 'success'}>{c.status || 'Active'}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{c.websitesCount ?? '-'}</TableCell>
                <TableCell className="text-muted-foreground">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger><MoreVertical className="h-4 w-4 text-muted-foreground" /></DropdownMenuTrigger>
                    <DropdownMenuContent>
                      {c.status === 'suspended' ? (
                        <DropdownMenuItem onClick={() => suspendMutation.mutate({ id: c.id, status: 'active' })}>
                          <UserCheck className="h-4 w-4 mr-2" /> Unsuspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem variant="destructive" onClick={() => suspendMutation.mutate({ id: c.id, status: 'suspended' })}>
                          <UserX className="h-4 w-4 mr-2" /> Suspend
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Customer</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => { createMutation.mutate(d, { onSuccess: () => { setShowAdd(false); reset() } }) })} className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Organization Name</label><Input {...register('name', { required: true })} placeholder="Acme Inc." /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Email (login username)</label><Input type="email" {...register('email', { required: true })} placeholder="admin@acme.com" /></div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" {...register('password', { required: true })} placeholder="Min 10 chars, upper+lower+number+special" />
              <p className="text-xs text-muted-foreground">Must be at least 10 characters with uppercase, lowercase, numbers, and special characters.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Package</label>
              <Select {...register('planId', { setValueAs: (v) => v ? Number(v) : undefined })}>
                <option value="">Select a package (optional)</option>
                {planList.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
