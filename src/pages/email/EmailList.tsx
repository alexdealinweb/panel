import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useMailboxes, useDeleteMailbox, useForwarders, useDeleteForwarder } from '@/api/hooks/useEmails'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Mail, Plus, Trash2, ArrowRight } from 'lucide-react'

export function EmailList() {
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''

  const { data: mailboxData, isLoading: mailboxLoading } = useMailboxes(websiteId)
  const { data: forwarderData, isLoading: forwarderLoading } = useForwarders(websiteId)
  const deleteMailbox = useDeleteMailbox(websiteId)
  const deleteForwarder = useDeleteForwarder(websiteId)
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'mailbox' | 'forwarder'; id: string; label: string } | null>(null)

  const mailboxes = mailboxData?.items || []
  const forwarders = forwarderData?.items || []

  if (!websiteId) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold tracking-tight">Email</h1><p className="text-muted-foreground">Manage email accounts and forwarders.</p></div>
        <EmptyState icon={Mail} title="Select a website" description="Navigate to a website first, then manage its email." action={<Link to="/websites"><Button>Go to Websites</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">Email</h1><p className="text-muted-foreground">Manage mailboxes and forwarders.</p></div>
        <Link to={`/email/create?websiteId=${websiteId}`}><Button><Plus className="h-4 w-4" /> Create Mailbox</Button></Link>
      </div>

      <Tabs defaultValue="mailboxes">
        <TabsList>
          <TabsTrigger value="mailboxes">Mailboxes ({mailboxes.length})</TabsTrigger>
          <TabsTrigger value="forwarders">Forwarders ({forwarders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="mailboxes">
          {mailboxLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : mailboxes.length === 0 ? (
            <EmptyState icon={Mail} title="No mailboxes" description="Create your first email account." action={<Link to={`/email/create?websiteId=${websiteId}`}><Button><Plus className="h-4 w-4" /> Create Mailbox</Button></Link>} />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Address</TableHead><TableHead>Quota</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
              <TableBody>
                {mailboxes.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-medium">{m.address}</TableCell>
                    <TableCell>
                      {m.quotaMb ? (
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${Math.min(100, ((m.usedMb || 0) / m.quotaMb) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-muted-foreground">{m.usedMb || 0}/{m.quotaMb} MB</span>
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'mailbox', id: m.id, label: m.address })}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>

        <TabsContent value="forwarders">
          {forwarderLoading ? (
            <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : forwarders.length === 0 ? (
            <EmptyState icon={ArrowRight} title="No forwarders" description="Create email forwarders to redirect mail." />
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>From</TableHead><TableHead>To</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
              <TableBody>
                {forwarders.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-medium">{f.address}</TableCell>
                    <TableCell className="text-muted-foreground">{f.forwardTo}</TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteTarget({ type: 'forwarder', id: f.id, label: f.address })}>
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
        title={`Delete ${deleteTarget?.type === 'mailbox' ? 'Mailbox' : 'Forwarder'}`}
        description={`Are you sure you want to delete "${deleteTarget?.label}"?`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          if (deleteTarget) {
            if (deleteTarget.type === 'mailbox') deleteMailbox.mutate(deleteTarget.id)
            else deleteForwarder.mutate(deleteTarget.id)
          }
        }}
      />
    </div>
  )
}
