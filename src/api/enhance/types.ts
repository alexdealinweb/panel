export interface Website {
  id: string
  domain: string
  status: string
  serverIp?: string
  phpVersion?: string
  appServerId?: string
  kind?: string
  orgId?: string
  createdAt?: string
  updatedAt?: string
  suspendedAt?: string
  plan?: string
  diskUsage?: number
}

export interface WebsiteCreate {
  domain: string
  subscriptionId?: number
  phpVersion?: string
  appServerId?: string
  kind?: string
}

export interface Domain {
  id: string
  domain: string
  websiteId?: string
  orgId?: string
  createdAt?: string
  mappingKind?: string
}

export interface DnsRecord {
  id: string
  zoneId?: string
  type: 'A' | 'AAAA' | 'CNAME' | 'MX' | 'TXT' | 'NS' | 'SRV' | 'CAA'
  name: string
  value: string
  priority?: number
  ttl?: number
}

export interface DnsRecordCreate {
  type: DnsRecord['type']
  name: string
  value: string
  priority?: number
  ttl?: number
}

export interface Mailbox {
  id: string
  address: string
  domain?: string
  quotaMb?: number
  usedMb?: number
  createdAt?: string
}

export interface MailboxCreate {
  address: string
  password: string
  quotaMb?: number
}

export interface Forwarder {
  id: string
  address: string
  forwardTo: string
}

export interface Autoresponder {
  id: string
  address: string
  enabled: boolean
  subject?: string
  body?: string
}

export interface Database {
  id: string
  name: string
  size?: number
  createdAt?: string
  websiteId?: string
  charset?: string
}

export interface DatabaseCreate {
  name: string
  username?: string
  password?: string
  charset?: string
}

export interface FtpUser {
  id: string
  username: string
  homeDir?: string
  websiteId?: string
}

export interface FtpUserCreate {
  username: string
  password: string
  homeDir?: string
}

export interface Backup {
  id: string
  websiteId?: string
  startedAt?: string
  completedAt?: string
  size?: number
  kind?: string
  status?: string
}

export interface SslCert {
  id: string
  domain?: string
  issuer?: string
  validFrom?: string
  validTo?: string
  status?: string
  autoRenew?: boolean
}

export interface SslCertUpload {
  cert: string
  key: string
}

export interface WordPressInstall {
  id: string
  version?: string
  path?: string
  siteUrl?: string
  adminUrl?: string
  updateAvailable?: string
  debugMode?: boolean
}

export interface WordPressPlugin {
  name: string
  version?: string
  status?: string
  updateAvailable?: string
}

export interface Server {
  id: string
  friendlyName?: string
  hostname?: string
  ip?: string
  roles?: string[]
  status?: string
  groupId?: string
}

export interface ServerStatus {
  cpuUsage?: number
  memoryTotal?: number
  memoryUsed?: number
  diskTotal?: number
  diskUsed?: number
  uptime?: number
  load?: number[]
}

export interface Customer {
  id: string
  orgId?: string
  name?: string
  email?: string
  status?: string
  createdAt?: string
}

export interface CustomerCreate {
  name: string
  email: string
  password?: string
}

export interface Org {
  id: string
  name: string
  status?: string
  createdAt?: string
  parentId?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total?: number
  offset?: number
  limit?: number
}
