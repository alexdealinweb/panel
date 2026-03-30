import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Globe, Mail, Database, HardDrive,
  Shield, FileCode, Server, Users, Settings, ChevronDown,
  FolderUp, Archive, MonitorSmartphone
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
  children?: { label: string; href: string }[]
}

const navGroups: { label: string; items: NavItem[] }[] = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Sites',
    items: [
      {
        label: 'Websites',
        href: '/websites',
        icon: MonitorSmartphone,
      },
      { label: 'Domains', href: '/domains', icon: Globe },
      { label: 'Email', href: '/email', icon: Mail },
      { label: 'Databases', href: '/databases', icon: Database },
      { label: 'FTP Accounts', href: '/ftp', icon: FolderUp },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { label: 'Backups', href: '/backups', icon: Archive },
      { label: 'SSL Certificates', href: '/ssl', icon: Shield },
      { label: 'WordPress', href: '/wordpress', icon: FileCode },
    ],
  },
  {
    label: 'Admin',
    items: [
      { label: 'Servers', href: '/servers', icon: Server },
      { label: 'Customers', href: '/customers', icon: Users },
      { label: 'Settings', href: '/settings', icon: Settings },
    ],
  },
]

function SidebarLink({ item }: { item: NavItem }) {
  const location = useLocation()
  const [expanded, setExpanded] = useState(false)
  const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/')
  const Icon = item.icon

  if (item.children) {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className={cn(
            'flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm transition-colors',
            isActive ? 'bg-sidebar-active text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          <span className="flex-1 text-left">{item.label}</span>
          <ChevronDown className={cn('h-3 w-3 transition-transform', expanded && 'rotate-180')} />
        </button>
        {expanded && (
          <div className="ml-6 mt-1 space-y-0.5">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                className={({ isActive }) => cn(
                  'block px-3 py-1.5 rounded-md text-sm transition-colors',
                  isActive ? 'bg-sidebar-active text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground'
                )}
              >
                {child.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NavLink
      to={item.href}
      end={item.href === '/'}
      className={({ isActive }) => cn(
        'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
        isActive ? 'bg-sidebar-active text-foreground' : 'text-sidebar-foreground hover:bg-sidebar-hover hover:text-foreground'
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{item.label}</span>
    </NavLink>
  )
}

export function Sidebar() {
  return (
    <aside className="w-60 h-screen bg-sidebar border-r flex flex-col shrink-0 sticky top-0">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          <span className="font-bold text-foreground text-lg">EnhanceUI</span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <SidebarLink key={item.href} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  )
}
