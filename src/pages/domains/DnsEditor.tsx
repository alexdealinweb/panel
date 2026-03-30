import { useParams, useSearchParams } from 'react-router-dom'
import { useDnsRecords, useCreateDnsRecord, useUpdateDnsRecord, useDeleteDnsRecord } from '@/api/hooks/useDomains'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Card, CardContent } from '@/components/ui/card'
import { Globe, Plus, Trash2, Pencil, Save, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import type { DnsRecordCreate, DnsRecord } from '@/api/enhance/types'

const DNS_TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV', 'CAA'] as const

function typeColor(type: string) {
  const colors: Record<string, string> = {
    A: 'bg-blue-500/10 text-blue-400',
    AAAA: 'bg-purple-500/10 text-purple-400',
    CNAME: 'bg-green-500/10 text-green-400',
    MX: 'bg-amber-500/10 text-amber-400',
    TXT: 'bg-slate-500/10 text-slate-400',
    NS: 'bg-cyan-500/10 text-cyan-400',
    SRV: 'bg-pink-500/10 text-pink-400',
    CAA: 'bg-red-500/10 text-red-400',
  }
  return colors[type] || 'bg-secondary text-secondary-foreground'
}

export function DnsEditor() {
  const { domainId } = useParams<{ domainId: string }>()
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''

  const { data, isLoading } = useDnsRecords(websiteId, domainId!)
  const createMutation = useCreateDnsRecord(websiteId, domainId!)
  const updateMutation = useUpdateDnsRecord(websiteId, domainId!)
  const deleteMutation = useDeleteDnsRecord(websiteId, domainId!)

  const [showAdd, setShowAdd] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<DnsRecordCreate>>({})
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  const { register, handleSubmit, reset, watch } = useForm<DnsRecordCreate>({
    defaultValues: { type: 'A', name: '', value: '', ttl: 3600 },
  })

  const records = data?.items || []
  const selectedType = watch('type')

  const startEdit = (record: DnsRecord) => {
    setEditingId(record.id)
    setEditValues({ name: record.name, value: record.value, ttl: record.ttl, priority: record.priority })
  }

  const saveEdit = (recordId: string) => {
    updateMutation.mutate({ recordId, data: editValues }, {
      onSuccess: () => setEditingId(null),
    })
  }

  const onAdd = (data: DnsRecordCreate) => {
    createMutation.mutate(data, {
      onSuccess: () => { setShowAdd(false); reset() },
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DNS Records</h1>
          <p className="text-muted-foreground">Manage DNS zone for this domain.</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Add Record
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : records.length === 0 ? (
        <EmptyState
          icon={Globe}
          title="No DNS records"
          description="Add DNS records to configure this domain."
          action={<Button onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Record</Button>}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead className="w-20">TTL</TableHead>
                  <TableHead className="w-20">Priority</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-mono font-semibold ${typeColor(record.type)}`}>
                        {record.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      {editingId === record.id ? (
                        <Input value={editValues.name || ''} onChange={(e) => setEditValues({ ...editValues, name: e.target.value })} className="h-8" />
                      ) : (
                        <span className="font-mono text-sm">{record.name}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === record.id ? (
                        <Input value={editValues.value || ''} onChange={(e) => setEditValues({ ...editValues, value: e.target.value })} className="h-8" />
                      ) : (
                        <span className="font-mono text-sm break-all">{record.value}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === record.id ? (
                        <Input type="number" value={editValues.ttl || ''} onChange={(e) => setEditValues({ ...editValues, ttl: parseInt(e.target.value) })} className="h-8 w-20" />
                      ) : (
                        <span className="text-muted-foreground">{record.ttl || '-'}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.priority ?? '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {editingId === record.id ? (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => saveEdit(record.id)} className="h-8 w-8">
                              <Save className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setEditingId(null)} className="h-8 w-8">
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => startEdit(record)} className="h-8 w-8">
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(record.id)} className="h-8 w-8">
                              <Trash2 className="h-3 w-3 text-red-400" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add DNS Record</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select {...register('type')}>
                {DNS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input placeholder="@ or subdomain" {...register('name', { required: true })} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input placeholder={selectedType === 'A' ? '1.2.3.4' : selectedType === 'CNAME' ? 'target.example.com' : 'Value'} {...register('value', { required: true })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">TTL</label>
                <Input type="number" defaultValue={3600} {...register('ttl', { valueAsNumber: true })} />
              </div>
              {(selectedType === 'MX' || selectedType === 'SRV') && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Input type="number" defaultValue={10} {...register('priority', { valueAsNumber: true })} />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Adding...' : 'Add Record'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title="Delete DNS Record"
        description="Are you sure you want to delete this DNS record?"
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget) }}
      />
    </div>
  )
}
