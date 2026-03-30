import { apiRequest, getOrgId } from './client'
import type {
  Website, WebsiteCreate, Domain, DnsRecord, DnsRecordCreate,
  Mailbox, MailboxCreate, Forwarder, Autoresponder,
  Database, DatabaseCreate, FtpUser, FtpUserCreate,
  Backup, SslCert, SslCertUpload,
  WordPressInstall, WordPressPlugin,
  Server, ServerStatus, Customer, CustomerCreate, Org,
} from './types'

// Orgs
export const orgs = {
  list: () => apiRequest<{ items: Org[] }>('GET', 'orgs'),
  get: (orgId: string) => apiRequest<Org>('GET', `orgs/${orgId}`),
}

// Websites
export const websites = {
  list: (params?: { offset?: number; limit?: number; sortBy?: string }) => {
    const orgId = getOrgId()
    const qs = params ? '?' + new URLSearchParams(params as Record<string, string>).toString() : ''
    return apiRequest<{ items: Website[] }>('GET', `orgs/${orgId}/websites${qs}`)
  },
  get: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<Website>('GET', `orgs/${orgId}/websites/${websiteId}`)
  },
  create: (data: WebsiteCreate) => {
    const orgId = getOrgId()
    return apiRequest<Website>('POST', `orgs/${orgId}/websites`, data)
  },
  update: (websiteId: string, data: Partial<Website>) => {
    const orgId = getOrgId()
    return apiRequest<Website>('PATCH', `orgs/${orgId}/websites/${websiteId}`, data)
  },
  delete: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('DELETE', `orgs/${orgId}/websites/${websiteId}`)
  },
}

// Domains
export const domains = {
  list: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: Domain[] }>('GET', `orgs/${orgId}/websites/${websiteId}/domains`)
  },
  create: (websiteId: string, data: { domain: string; mappingKind?: string }) => {
    const orgId = getOrgId()
    return apiRequest<Domain>('POST', `orgs/${orgId}/websites/${websiteId}/domains`, data)
  },
  delete: (websiteId: string, domainId: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('DELETE', `orgs/${orgId}/websites/${websiteId}/domains/${domainId}`)
  },
}

// DNS
export const dns = {
  list: (websiteId: string, domainId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: DnsRecord[] }>('GET', `orgs/${orgId}/websites/${websiteId}/domains/${domainId}/dns-records`)
  },
  create: (websiteId: string, domainId: string, data: DnsRecordCreate) => {
    const orgId = getOrgId()
    return apiRequest<DnsRecord>('POST', `orgs/${orgId}/websites/${websiteId}/domains/${domainId}/dns-records`, data)
  },
  update: (websiteId: string, domainId: string, recordId: string, data: Partial<DnsRecordCreate>) => {
    const orgId = getOrgId()
    return apiRequest<DnsRecord>('PATCH', `orgs/${orgId}/websites/${websiteId}/domains/${domainId}/dns-records/${recordId}`, data)
  },
  delete: (websiteId: string, domainId: string, recordId: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('DELETE', `orgs/${orgId}/websites/${websiteId}/domains/${domainId}/dns-records/${recordId}`)
  },
}

// Email / Mailboxes
export const email = {
  listMailboxes: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: Mailbox[] }>('GET', `orgs/${orgId}/websites/${websiteId}/emails`)
  },
  createMailbox: (websiteId: string, data: MailboxCreate) => {
    const orgId = getOrgId()
    return apiRequest<Mailbox>('POST', `orgs/${orgId}/websites/${websiteId}/emails`, data)
  },
  deleteMailbox: (websiteId: string, emailId: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('DELETE', `orgs/${orgId}/websites/${websiteId}/emails/${emailId}`)
  },
  listForwarders: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: Forwarder[] }>('GET', `orgs/${orgId}/websites/${websiteId}/email-forwarders`)
  },
  createForwarder: (websiteId: string, data: { address: string; forwardTo: string }) => {
    const orgId = getOrgId()
    return apiRequest<Forwarder>('POST', `orgs/${orgId}/websites/${websiteId}/email-forwarders`, data)
  },
  deleteForwarder: (websiteId: string, forwarderId: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('DELETE', `orgs/${orgId}/websites/${websiteId}/email-forwarders/${forwarderId}`)
  },
  getAutoresponder: (websiteId: string, emailId: string) => {
    const orgId = getOrgId()
    return apiRequest<Autoresponder>('GET', `orgs/${orgId}/websites/${websiteId}/emails/${emailId}/autoresponder`)
  },
  updateAutoresponder: (websiteId: string, emailId: string, data: Partial<Autoresponder>) => {
    const orgId = getOrgId()
    return apiRequest<Autoresponder>('PATCH', `orgs/${orgId}/websites/${websiteId}/emails/${emailId}/autoresponder`, data)
  },
}

// Databases
export const databases = {
  list: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: Database[] }>('GET', `orgs/${orgId}/websites/${websiteId}/mysql-dbs`)
  },
  create: (websiteId: string, data: DatabaseCreate) => {
    const orgId = getOrgId()
    return apiRequest<Database>('POST', `orgs/${orgId}/websites/${websiteId}/mysql-dbs`, data)
  },
  delete: (websiteId: string, dbId: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('DELETE', `orgs/${orgId}/websites/${websiteId}/mysql-dbs/${dbId}`)
  },
  getSsoUrl: (websiteId: string, dbId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ url: string }>('GET', `orgs/${orgId}/websites/${websiteId}/mysql-dbs/${dbId}/phpmyadmin`)
  },
}

// FTP
export const ftp = {
  list: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: FtpUser[] }>('GET', `orgs/${orgId}/websites/${websiteId}/ftp-users`)
  },
  create: (websiteId: string, data: FtpUserCreate) => {
    const orgId = getOrgId()
    return apiRequest<FtpUser>('POST', `orgs/${orgId}/websites/${websiteId}/ftp-users`, data)
  },
  delete: (websiteId: string, ftpUserId: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('DELETE', `orgs/${orgId}/websites/${websiteId}/ftp-users/${ftpUserId}`)
  },
}

// Backups
export const backups = {
  list: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: Backup[] }>('GET', `orgs/${orgId}/websites/${websiteId}/backups`)
  },
  create: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<Backup>('POST', `orgs/${orgId}/websites/${websiteId}/backups`)
  },
  restore: (websiteId: string, backupId: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('POST', `orgs/${orgId}/websites/${websiteId}/backups/${backupId}/restore`)
  },
}

// SSL
export const ssl = {
  list: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: SslCert[] }>('GET', `orgs/${orgId}/websites/${websiteId}/ssl`)
  },
  issue: (websiteId: string, domainId: string) => {
    const orgId = getOrgId()
    return apiRequest<SslCert>('POST', `orgs/${orgId}/websites/${websiteId}/ssl`, { domainId })
  },
  upload: (websiteId: string, data: SslCertUpload) => {
    const orgId = getOrgId()
    return apiRequest<SslCert>('POST', `orgs/${orgId}/websites/${websiteId}/ssl`, data)
  },
  delete: (websiteId: string, sslId: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('DELETE', `orgs/${orgId}/websites/${websiteId}/ssl/${sslId}`)
  },
}

// WordPress
export const wordpress = {
  list: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: WordPressInstall[] }>('GET', `orgs/${orgId}/websites/${websiteId}/wordpress`)
  },
  install: (websiteId: string) => {
    const orgId = getOrgId()
    return apiRequest<WordPressInstall>('POST', `orgs/${orgId}/websites/${websiteId}/wordpress`)
  },
  update: (websiteId: string, wpId: string, data: Partial<WordPressInstall>) => {
    const orgId = getOrgId()
    return apiRequest<WordPressInstall>('PATCH', `orgs/${orgId}/websites/${websiteId}/wordpress/${wpId}`, data)
  },
  listPlugins: (websiteId: string, wpId: string) => {
    const orgId = getOrgId()
    return apiRequest<{ items: WordPressPlugin[] }>('GET', `orgs/${orgId}/websites/${websiteId}/wordpress/${wpId}/plugins`)
  },
  updatePlugin: (websiteId: string, wpId: string, pluginName: string) => {
    const orgId = getOrgId()
    return apiRequest<void>('POST', `orgs/${orgId}/websites/${websiteId}/wordpress/${wpId}/plugins/${pluginName}/update`)
  },
}

// Servers
export const servers = {
  list: () => apiRequest<{ items: Server[] }>('GET', 'servers'),
  get: (serverId: string) => apiRequest<Server>('GET', `servers/${serverId}`),
  getStatus: (serverId: string) => apiRequest<ServerStatus>('GET', `servers/${serverId}/status`),
  getDiskUsage: (serverId: string) => apiRequest<unknown>('GET', `servers/${serverId}/disk-usage`),
  getMemoryUsage: (serverId: string) => apiRequest<unknown>('GET', `servers/${serverId}/memory-usage`),
}

// Customers
export const customers = {
  list: () => {
    const orgId = getOrgId()
    return apiRequest<{ items: Customer[] }>('GET', `orgs/${orgId}/customers`)
  },
  get: (customerId: string) => {
    const orgId = getOrgId()
    return apiRequest<Customer>('GET', `orgs/${orgId}/customers/${customerId}`)
  },
  create: (data: CustomerCreate) => {
    const orgId = getOrgId()
    return apiRequest<Customer>('POST', `orgs/${orgId}/customers`, data)
  },
  update: (customerId: string, data: Partial<Customer>) => {
    const orgId = getOrgId()
    return apiRequest<Customer>('PATCH', `orgs/${orgId}/customers/${customerId}`, data)
  },
}

// System
export const system = {
  version: () => apiRequest<{ version: string }>('GET', 'version'),
  status: () => apiRequest<{ status: string }>('GET', 'status'),
  testConnection: () => apiRequest<{ version: string }>('GET', 'version'),
}
