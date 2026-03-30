import { useParams, Link } from 'react-router-dom'
import { useWebsite } from '@/api/hooks/useWebsites'
import { useDomains, useCreateDomain, useDeleteDomain } from '@/api/hooks/useDomains'
import { useMailboxes } from '@/api/hooks/useEmails'
import { useDatabases } from '@/api/hooks/useDatabases'
import { useBackups, useCreateBackup } from '@/api/hooks/useBackups'
import { useSslCerts } from '@/api/hooks/useSSL'
import { useWordPressInstalls } from '@/api/hooks/useWordPress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Globe, Mail, Database, Archive, Shield, FileCode, Plus, Trash2, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'

function OverviewTab({ website }: { website: { id: string; domain: string; status?: string; phpVersion?: string; serverIp?: string; createdAt?: string; kind?: string } }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-sm">Website Info</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span>{website.domain?.domain}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge variant="success">{website.status || 'Active'}</Badge></div>
          <div className="flex justify-between"><span className="text-muted-foreground">PHP Version</span><span>{website.phpVersion || '-'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Server</span><span>{website.serverIp || '-'}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span>{website.kind || '-'}</span></div>
          {website.createdAt && (
            <div className="flex justify-between"><span className="text-muted-foreground">Created</span><span>{new Date(website.createdAt).toLocaleDateString()}</span></div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-sm">Quick Actions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" className="w-full justify-start" onClick={() => window.open(`https://${website.domain?.domain}`, '_blank')}>
            <ExternalLink className="h-4 w-4 mr-2" /> Visit Website
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function DomainsTab({ websiteId }: { websiteId: string }) {
  const { data, isLoading } = useDomains(websiteId)
  const createMutation = useCreateDomain(websiteId)
  const deleteMutation = useDeleteDomain(websiteId)
  const [showAdd, setShowAdd] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const { register, handleSubmit, reset } = useForm<{ domain: string }>()

  const domains = data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Domains</h3>
        <Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Domain</Button>
      </div>
      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : domains.length === 0 ? (
        <EmptyState icon={Globe} title="No domains" description="Add a domain to this website." action={<Button size="sm" onClick={() => setShowAdd(true)}><Plus className="h-4 w-4" /> Add Domain</Button>} />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">
                  <Link to={`/domains/${d.id}?websiteId=${websiteId}`} className="hover:underline">{d.domain}</Link>
                </TableCell>
                <TableCell className="text-muted-foreground">{d.mappingKind || '-'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(d.id)}>
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
          <DialogHeader><DialogTitle>Add Domain</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => { createMutation.mutate(d, { onSuccess: () => { setShowAdd(false); reset() } }) })} className="space-y-4">
            <Input placeholder="example.com" {...register('domain', { required: true })} />
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowAdd(false)}>Cancel</Button>
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Adding...' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Remove Domain" description="Are you sure you want to remove this domain?" confirmLabel="Remove" variant="destructive" onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget) }} />
    </div>
  )
}

function EmailTab({ websiteId }: { websiteId: string }) {
  const { data, isLoading } = useMailboxes(websiteId)
  const mailboxes = data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Email Accounts</h3>
        <Link to={`/email?websiteId=${websiteId}`}><Button size="sm"><Mail className="h-4 w-4" /> Manage Email</Button></Link>
      </div>
      {isLoading ? <Skeleton className="h-32 w-full" /> : mailboxes.length === 0 ? (
        <EmptyState icon={Mail} title="No mailboxes" description="Create email accounts for this website." />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Address</TableHead><TableHead>Quota</TableHead></TableRow></TableHeader>
          <TableBody>
            {mailboxes.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.address}</TableCell>
                <TableCell className="text-muted-foreground">{m.quotaMb ? `${m.usedMb || 0}/${m.quotaMb} MB` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function DatabasesTab({ websiteId }: { websiteId: string }) {
  const { data, isLoading } = useDatabases(websiteId)
  const dbs = data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Databases</h3>
        <Link to={`/databases?websiteId=${websiteId}`}><Button size="sm"><Database className="h-4 w-4" /> Manage Databases</Button></Link>
      </div>
      {isLoading ? <Skeleton className="h-32 w-full" /> : dbs.length === 0 ? (
        <EmptyState icon={Database} title="No databases" description="Create a MySQL database for this website." />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Size</TableHead></TableRow></TableHeader>
          <TableBody>
            {dbs.map((db) => (
              <TableRow key={db.id}>
                <TableCell className="font-medium">{db.name}</TableCell>
                <TableCell className="text-muted-foreground">{db.size ? `${(db.size / 1024 / 1024).toFixed(1)} MB` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function BackupsTab({ websiteId }: { websiteId: string }) {
  const { data, isLoading } = useBackups(websiteId)
  const createMutation = useCreateBackup(websiteId)
  const backupList = data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Backups</h3>
        <Button size="sm" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
          <Archive className="h-4 w-4" /> {createMutation.isPending ? 'Creating...' : 'New Backup'}
        </Button>
      </div>
      {isLoading ? <Skeleton className="h-32 w-full" /> : backupList.length === 0 ? (
        <EmptyState icon={Archive} title="No backups" description="Create a backup of this website." />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Size</TableHead></TableRow></TableHeader>
          <TableBody>
            {backupList.map((b) => (
              <TableRow key={b.id}>
                <TableCell>{b.startedAt ? new Date(b.startedAt).toLocaleString() : '-'}</TableCell>
                <TableCell><Badge variant={b.status === 'completed' ? 'success' : 'secondary'}>{b.status || 'Unknown'}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{b.size ? `${(b.size / 1024 / 1024).toFixed(1)} MB` : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function SslTab({ websiteId }: { websiteId: string }) {
  const { data, isLoading } = useSslCerts(websiteId)
  const certs = data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">SSL Certificates</h3>
        <Link to={`/ssl?websiteId=${websiteId}`}><Button size="sm"><Shield className="h-4 w-4" /> Manage SSL</Button></Link>
      </div>
      {isLoading ? <Skeleton className="h-32 w-full" /> : certs.length === 0 ? (
        <EmptyState icon={Shield} title="No SSL certificates" description="Issue or upload an SSL certificate." />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Domain</TableHead><TableHead>Status</TableHead><TableHead>Expires</TableHead></TableRow></TableHeader>
          <TableBody>
            {certs.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.domain || '-'}</TableCell>
                <TableCell><Badge variant={c.status === 'valid' ? 'success' : 'warning'}>{c.status || '-'}</Badge></TableCell>
                <TableCell className="text-muted-foreground">{c.validTo ? new Date(c.validTo).toLocaleDateString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function WordPressTab({ websiteId }: { websiteId: string }) {
  const { data, isLoading } = useWordPressInstalls(websiteId)
  const installs = data?.items || []

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">WordPress</h3>
        <Link to={`/wordpress?websiteId=${websiteId}`}><Button size="sm"><FileCode className="h-4 w-4" /> Manage WordPress</Button></Link>
      </div>
      {isLoading ? <Skeleton className="h-32 w-full" /> : installs.length === 0 ? (
        <EmptyState icon={FileCode} title="No WordPress installs" description="Install WordPress on this website." />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Path</TableHead><TableHead>Version</TableHead><TableHead>Update</TableHead></TableRow></TableHeader>
          <TableBody>
            {installs.map((wp) => (
              <TableRow key={wp.id}>
                <TableCell className="font-medium">{wp.path || '/'}</TableCell>
                <TableCell>{wp.version || '-'}</TableCell>
                <TableCell>{wp.updateAvailable ? <Badge variant="warning">Update available</Badge> : <Badge variant="success">Up to date</Badge>}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

export function WebsiteDetail() {
  const { id } = useParams<{ id: string }>()
  const { data: website, isLoading } = useWebsite(id!)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!website) {
    return <div className="text-muted-foreground">Website not found.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{website.domain?.domain}</h1>
          <p className="text-muted-foreground">Website management</p>
        </div>
        <Button variant="outline" onClick={() => window.open(`https://${website.domain?.domain}`, '_blank')}>
          <ExternalLink className="h-4 w-4" /> Visit
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="domains">Domains</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
          <TabsTrigger value="databases">Databases</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="ssl">SSL</TabsTrigger>
          <TabsTrigger value="wordpress">WordPress</TabsTrigger>
        </TabsList>
        <TabsContent value="overview"><OverviewTab website={website} /></TabsContent>
        <TabsContent value="domains"><DomainsTab websiteId={id!} /></TabsContent>
        <TabsContent value="email"><EmailTab websiteId={id!} /></TabsContent>
        <TabsContent value="databases"><DatabasesTab websiteId={id!} /></TabsContent>
        <TabsContent value="backups"><BackupsTab websiteId={id!} /></TabsContent>
        <TabsContent value="ssl"><SslTab websiteId={id!} /></TabsContent>
        <TabsContent value="wordpress"><WordPressTab websiteId={id!} /></TabsContent>
      </Tabs>
    </div>
  )
}
