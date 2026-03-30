import { useLocation, Link } from 'react-router-dom'
import { Settings, ChevronRight, FlaskConical, Shield, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getMode } from '@/api/enhance/client'
import { useEffect, useState } from 'react'
import axios from 'axios'

function getBreadcrumbs(pathname: string): { label: string; href: string }[] {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []

  const labelMap: Record<string, string> = {
    websites: 'Websites',
    domains: 'Domains',
    email: 'Email',
    databases: 'Databases',
    ftp: 'FTP Accounts',
    backups: 'Backups',
    ssl: 'SSL Certificates',
    wordpress: 'WordPress',
    servers: 'Servers',
    customers: 'Customers',
    settings: 'Settings',
    create: 'Create',
  }

  let path = ''
  for (const seg of segments) {
    path += `/${seg}`
    crumbs.push({
      label: labelMap[seg] || seg,
      href: path,
    })
  }

  return crumbs
}

export function TopBar() {
  const location = useLocation()
  const breadcrumbs = getBreadcrumbs(location.pathname)
  const mode = getMode()
  const [readOnly, setReadOnly] = useState<boolean | null>(null)

  useEffect(() => {
    if (mode === 'live') {
      axios.get('/api/status').then((r) => setReadOnly(r.data.readOnly ?? null)).catch(() => {})
    }
  }, [mode])

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-0 z-40">
      <div className="flex items-center gap-2 text-sm">
        <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors">
          Home
        </Link>
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-2">
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
            {i === breadcrumbs.length - 1 ? (
              <span className="text-foreground font-medium">{crumb.label}</span>
            ) : (
              <Link to={crumb.href} className="text-muted-foreground hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {/* Mode badge */}
        <Link to="/settings">
          {mode === 'demo' ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-xs font-medium text-blue-600">
              <FlaskConical className="h-3 w-3" /> Demo
            </span>
          ) : readOnly ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-600">
              <Shield className="h-3 w-3" /> Read-Only
            </span>
          ) : readOnly === false ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 px-3 py-1 text-xs font-medium text-amber-600">
              <ShieldAlert className="h-3 w-3" /> Live
            </span>
          ) : null}
        </Link>
        <Link to="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </header>
  )
}
