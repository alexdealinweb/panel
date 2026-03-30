import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { useSslCerts, useIssueSsl, useUploadSsl, useDeleteSsl } from '@/api/hooks/useSSL'
import { useDomains } from '@/api/hooks/useDomains'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { AlertDialog } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select } from '@/components/ui/select'
import { Shield, Plus, Trash2, Upload } from 'lucide-react'
import { useForm } from 'react-hook-form'

export function SSLManager() {
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''
  const { data, isLoading } = useSslCerts(websiteId)
  const { data: domainsData } = useDomains(websiteId)
  const issueMutation = useIssueSsl(websiteId)
  const uploadMutation = useUploadSsl(websiteId)
  const deleteMutation = useDeleteSsl(websiteId)

  const [showIssue, setShowIssue] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState('')
  const { register, handleSubmit, reset } = useForm<{ cert: string; key: string }>()

  const certs = data?.items || []
  const domainList = domainsData?.items || []

  if (!websiteId) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-3xl font-bold tracking-tight">SSL Certificates</h1></div>
        <EmptyState icon={Shield} title="Select a website" description="Navigate to a website first." action={<Link to="/websites"><Button>Go to Websites</Button></Link>} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-3xl font-bold tracking-tight">SSL Certificates</h1><p className="text-muted-foreground">Manage SSL/TLS certificates.</p></div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowUpload(true)}><Upload className="h-4 w-4" /> Upload</Button>
          <Button onClick={() => setShowIssue(true)}><Plus className="h-4 w-4" /> Issue Certificate</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : certs.length === 0 ? (
        <EmptyState icon={Shield} title="No certificates" description="Issue or upload an SSL certificate." action={<Button onClick={() => setShowIssue(true)}><Plus className="h-4 w-4" /> Issue Certificate</Button>} />
      ) : (
        <Table>
          <TableHeader><TableRow><TableHead>Domain</TableHead><TableHead>Issuer</TableHead><TableHead>Status</TableHead><TableHead>Valid Until</TableHead><TableHead className="w-10" /></TableRow></TableHeader>
          <TableBody>
            {certs.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.domain || '-'}</TableCell>
                <TableCell className="text-muted-foreground">{c.issuer || '-'}</TableCell>
                <TableCell>
                  <Badge variant={c.status === 'valid' ? 'success' : c.status === 'expired' ? 'destructive' : 'warning'}>
                    {c.status || 'Unknown'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.validTo ? new Date(c.validTo).toLocaleDateString() : '-'}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => setDeleteTarget(c.id)}><Trash2 className="h-4 w-4 text-muted-foreground" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Dialog open={showIssue} onOpenChange={setShowIssue}>
        <DialogContent>
          <DialogHeader><DialogTitle>Issue Let's Encrypt Certificate</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Domain</label>
              <Select value={selectedDomain} onChange={(e) => setSelectedDomain(e.target.value)}>
                <option value="">Select domain...</option>
                {domainList.map((d) => <option key={d.id} value={d.id}>{d.domain}</option>)}
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowIssue(false)}>Cancel</Button>
              <Button onClick={() => { issueMutation.mutate(selectedDomain, { onSuccess: () => setShowIssue(false) }) }} disabled={!selectedDomain || issueMutation.isPending}>
                {issueMutation.isPending ? 'Issuing...' : 'Issue Certificate'}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showUpload} onOpenChange={setShowUpload}>
        <DialogContent>
          <DialogHeader><DialogTitle>Upload Custom Certificate</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit((d) => { uploadMutation.mutate(d, { onSuccess: () => { setShowUpload(false); reset() } }) })} className="space-y-4">
            <div className="space-y-2"><label className="text-sm font-medium">Certificate (PEM)</label><Textarea rows={5} placeholder="-----BEGIN CERTIFICATE-----" {...register('cert', { required: true })} /></div>
            <div className="space-y-2"><label className="text-sm font-medium">Private Key (PEM)</label><Textarea rows={5} placeholder="-----BEGIN PRIVATE KEY-----" {...register('key', { required: true })} /></div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowUpload(false)}>Cancel</Button>
              <Button type="submit" disabled={uploadMutation.isPending}>{uploadMutation.isPending ? 'Uploading...' : 'Upload'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)} title="Delete Certificate" description="Remove this SSL certificate?" confirmLabel="Delete" variant="destructive" onConfirm={() => { if (deleteTarget) deleteMutation.mutate(deleteTarget) }} />
    </div>
  )
}
