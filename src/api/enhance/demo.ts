// Demo mode — returns realistic fake data so you can explore the UI
// without connecting to any real Enhance server.

const DEMO_WEBSITES = [
  { id: 'ws-1', domain: 'example.com', status: 'active', phpVersion: '8.3', serverIp: '10.0.0.1', appServerId: 'srv-1', kind: 'production', createdAt: '2024-06-15T10:00:00Z' },
  { id: 'ws-2', domain: 'shop.example.com', status: 'active', phpVersion: '8.2', serverIp: '10.0.0.1', appServerId: 'srv-1', kind: 'production', createdAt: '2024-08-20T14:00:00Z' },
  { id: 'ws-3', domain: 'staging.example.com', status: 'active', phpVersion: '8.3', serverIp: '10.0.0.2', appServerId: 'srv-2', kind: 'staging', createdAt: '2025-01-10T09:00:00Z' },
]

const DEMO_SERVERS = [
  { id: 'srv-1', friendlyName: 'web-prod-01', hostname: 'web01.infra.local', ip: '10.0.0.1', roles: ['Web', 'Email'], status: 'online' },
  { id: 'srv-2', friendlyName: 'web-staging-01', hostname: 'staging01.infra.local', ip: '10.0.0.2', roles: ['Web'], status: 'online' },
  { id: 'srv-3', friendlyName: 'db-prod-01', hostname: 'db01.infra.local', ip: '10.0.0.3', roles: ['Database', 'Backup'], status: 'online' },
]

const DEMO_DOMAINS: Record<string, Array<{ id: string; domain: string; mappingKind: string }>> = {
  'ws-1': [
    { id: 'dom-1', domain: 'example.com', mappingKind: 'primary' },
    { id: 'dom-2', domain: 'www.example.com', mappingKind: 'alias' },
  ],
  'ws-2': [
    { id: 'dom-3', domain: 'shop.example.com', mappingKind: 'primary' },
  ],
  'ws-3': [
    { id: 'dom-4', domain: 'staging.example.com', mappingKind: 'primary' },
  ],
}

const DEMO_DNS: Record<string, Array<{ id: string; type: string; name: string; value: string; ttl: number; priority?: number }>> = {
  'dom-1': [
    { id: 'dns-1', type: 'A', name: '@', value: '10.0.0.1', ttl: 3600 },
    { id: 'dns-2', type: 'A', name: 'www', value: '10.0.0.1', ttl: 3600 },
    { id: 'dns-3', type: 'MX', name: '@', value: 'mail.example.com', ttl: 3600, priority: 10 },
    { id: 'dns-4', type: 'TXT', name: '@', value: 'v=spf1 include:_spf.example.com ~all', ttl: 3600 },
    { id: 'dns-5', type: 'CNAME', name: 'mail', value: 'example.com', ttl: 3600 },
  ],
}

const DEMO_MAILBOXES: Record<string, Array<{ id: string; address: string; quotaMb: number; usedMb: number }>> = {
  'ws-1': [
    { id: 'mb-1', address: 'info@example.com', quotaMb: 1024, usedMb: 256 },
    { id: 'mb-2', address: 'admin@example.com', quotaMb: 2048, usedMb: 1100 },
  ],
}

const DEMO_DATABASES: Record<string, Array<{ id: string; name: string; size: number; charset: string }>> = {
  'ws-1': [
    { id: 'db-1', name: 'example_wp', size: 52428800, charset: 'utf8mb4' },
    { id: 'db-2', name: 'example_shop', size: 157286400, charset: 'utf8mb4' },
  ],
  'ws-2': [
    { id: 'db-3', name: 'shop_main', size: 209715200, charset: 'utf8mb4' },
  ],
}

const DEMO_BACKUPS: Record<string, Array<{ id: string; startedAt: string; status: string; size: number; kind: string }>> = {
  'ws-1': [
    { id: 'bk-1', startedAt: '2025-03-28T02:00:00Z', status: 'completed', size: 524288000, kind: 'Full' },
    { id: 'bk-2', startedAt: '2025-03-27T02:00:00Z', status: 'completed', size: 510000000, kind: 'Full' },
    { id: 'bk-3', startedAt: '2025-03-26T02:00:00Z', status: 'completed', size: 498000000, kind: 'Full' },
  ],
}

const DEMO_SSL: Record<string, Array<{ id: string; domain: string; issuer: string; status: string; validFrom: string; validTo: string }>> = {
  'ws-1': [
    { id: 'ssl-1', domain: 'example.com', issuer: "Let's Encrypt", status: 'valid', validFrom: '2025-01-15T00:00:00Z', validTo: '2025-04-15T00:00:00Z' },
    { id: 'ssl-2', domain: 'www.example.com', issuer: "Let's Encrypt", status: 'valid', validFrom: '2025-01-15T00:00:00Z', validTo: '2025-04-15T00:00:00Z' },
  ],
}

const DEMO_WP: Record<string, Array<{ id: string; version: string; path: string; siteUrl: string; adminUrl: string; updateAvailable: string; debugMode: boolean }>> = {
  'ws-1': [
    { id: 'wp-1', version: '6.5.2', path: '/', siteUrl: 'https://example.com', adminUrl: 'https://example.com/wp-admin', updateAvailable: '6.5.3', debugMode: false },
  ],
}

const DEMO_FTP: Record<string, Array<{ id: string; username: string; homeDir: string }>> = {
  'ws-1': [
    { id: 'ftp-1', username: 'deploy_user', homeDir: '/public_html' },
  ],
}

const DEMO_CUSTOMERS = [
  { id: 'cust-1', name: 'Acme Corp', email: 'billing@acme.com', status: 'active', createdAt: '2024-03-10T00:00:00Z' },
  { id: 'cust-2', name: 'Test Client', email: 'test@client.org', status: 'active', createdAt: '2024-09-01T00:00:00Z' },
]

// Simulate async delay
function delay(ms = 200): Promise<void> {
  return new Promise((r) => setTimeout(r, ms))
}

function extractWebsiteId(path: string): string {
  const match = path.match(/websites\/([^/]+)/)
  return match?.[1] || ''
}

function extractDomainId(path: string): string {
  const match = path.match(/domains\/([^/]+)/)
  return match?.[1] || ''
}

export async function handleDemoRequest<T>(method: string, path: string, _data?: unknown): Promise<T> {
  await delay(150 + Math.random() * 300)

  // Block writes in demo with a friendly message
  if (method !== 'GET') {
    throw new Error('Demo mode — write operations are disabled. Switch to Live mode in Settings to make real changes.')
  }

  // Servers
  if (path.match(/^servers$/)) return { items: DEMO_SERVERS } as T
  if (path.match(/^servers\/([^/]+)$/)) {
    const id = path.split('/')[1]
    return (DEMO_SERVERS.find((s) => s.id === id) || DEMO_SERVERS[0]) as T
  }
  if (path.match(/^servers\/([^/]+)\/status$/)) {
    return { cpuUsage: 23 + Math.random() * 15, memoryTotal: 8589934592, memoryUsed: 3221225472 + Math.random() * 1073741824, diskTotal: 107374182400, diskUsed: 42949672960, uptime: 864000 + Math.floor(Math.random() * 100000), load: [0.5, 0.8, 0.6] } as T
  }

  // System
  if (path === 'version') return { version: '12.4.0 (demo)' } as T
  if (path === 'status') return { status: 'ok' } as T

  // Orgs
  if (path === 'orgs') return { items: [{ id: 'demo-org', name: 'Demo Organization', status: 'active' }] } as T

  const wsId = extractWebsiteId(path)

  // Websites
  if (path.match(/websites$/) && !wsId) return { items: DEMO_WEBSITES } as T
  if (path.match(/websites\/[^/]+$/) && wsId) return (DEMO_WEBSITES.find((w) => w.id === wsId) || DEMO_WEBSITES[0]) as T

  // Domains
  if (path.includes('/domains') && !path.includes('/dns-records')) {
    const domId = extractDomainId(path)
    if (domId && wsId) return (DEMO_DOMAINS[wsId]?.find((d) => d.id === domId)) as T
    return { items: DEMO_DOMAINS[wsId] || [] } as T
  }

  // DNS
  if (path.includes('/dns-records')) {
    const domId = extractDomainId(path)
    return { items: DEMO_DNS[domId] || [] } as T
  }

  // Email
  if (path.includes('/emails') || path.includes('/email-forwarders')) {
    if (path.includes('/forwarders')) return { items: [] } as T
    return { items: DEMO_MAILBOXES[wsId] || [] } as T
  }

  // Databases
  if (path.includes('/mysql-dbs')) return { items: DEMO_DATABASES[wsId] || [] } as T

  // Backups
  if (path.includes('/backups')) return { items: DEMO_BACKUPS[wsId] || [] } as T

  // SSL
  if (path.includes('/ssl')) return { items: DEMO_SSL[wsId] || [] } as T

  // WordPress
  if (path.includes('/wordpress') && !path.includes('/plugins')) return { items: DEMO_WP[wsId] || [] } as T
  if (path.includes('/plugins')) return { items: [{ name: 'WooCommerce', version: '8.9.1', status: 'active', updateAvailable: '8.9.2' }, { name: 'Yoast SEO', version: '22.5', status: 'active', updateAvailable: '' }, { name: 'Contact Form 7', version: '5.9', status: 'inactive', updateAvailable: '5.9.1' }] } as T

  // FTP
  if (path.includes('/ftp-users')) return { items: DEMO_FTP[wsId] || [] } as T

  // Customers
  if (path.includes('/customers')) return { items: DEMO_CUSTOMERS } as T

  return { items: [] } as T
}
