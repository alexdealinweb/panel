import { useLocation, Link } from 'react-router-dom'
import { Settings, ChevronRight, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'

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
  const { session, logout } = useAuth()
  const breadcrumbs = getBreadcrumbs(location.pathname)

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
        {session && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-3.5 w-3.5" />
            <span>{session.email}</span>
          </div>
        )}
        <Link to="/settings">
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="icon" onClick={logout} title="Sign out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
