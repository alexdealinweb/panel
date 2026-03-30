import { useSearchParams, Link } from 'react-router-dom'
import { useDomains } from '@/api/hooks/useDomains'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { Globe, ExternalLink } from 'lucide-react'

export function DomainList() {
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''

  const { data, isLoading } = useDomains(websiteId)
  const domains = data?.items || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Domains</h1>
        <p className="text-muted-foreground">Manage domains and DNS records.</p>
      </div>

      {!websiteId ? (
        <EmptyState
          icon={Globe}
          title="Select a website"
          description="Navigate to a website first, then manage its domains."
          action={<Link to="/websites"><Button>Go to Websites</Button></Link>}
        />
      ) : isLoading ? (
        <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : domains.length === 0 ? (
        <EmptyState icon={Globe} title="No domains" description="This website has no domains attached." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Domain</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="w-20">DNS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {domains.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.domain}</TableCell>
                <TableCell className="text-muted-foreground">{d.mappingKind || '-'}</TableCell>
                <TableCell>
                  <Link to={`/domains/${d.id}/dns?websiteId=${websiteId}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3 w-3 mr-1" /> DNS
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
