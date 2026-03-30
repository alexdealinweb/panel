import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { Layout } from '@/components/layout/Layout'
import { Skeleton } from '@/components/ui/skeleton'

const Dashboard = lazy(() => import('@/pages/Dashboard').then((m) => ({ default: m.Dashboard })))
const WebsiteList = lazy(() => import('@/pages/websites/WebsiteList').then((m) => ({ default: m.WebsiteList })))
const WebsiteCreate = lazy(() => import('@/pages/websites/WebsiteCreate').then((m) => ({ default: m.WebsiteCreate })))
const WebsiteDetail = lazy(() => import('@/pages/websites/WebsiteDetail').then((m) => ({ default: m.WebsiteDetail })))
const DomainList = lazy(() => import('@/pages/domains/DomainList').then((m) => ({ default: m.DomainList })))
const DnsEditor = lazy(() => import('@/pages/domains/DnsEditor').then((m) => ({ default: m.DnsEditor })))
const EmailList = lazy(() => import('@/pages/email/EmailList').then((m) => ({ default: m.EmailList })))
const EmailCreate = lazy(() => import('@/pages/email/EmailCreate').then((m) => ({ default: m.EmailCreate })))
const DatabaseList = lazy(() => import('@/pages/databases/DatabaseList').then((m) => ({ default: m.DatabaseList })))
const DatabaseCreate = lazy(() => import('@/pages/databases/DatabaseCreate').then((m) => ({ default: m.DatabaseCreate })))
const FtpList = lazy(() => import('@/pages/ftp/FtpList').then((m) => ({ default: m.FtpList })))
const BackupList = lazy(() => import('@/pages/backups/BackupList').then((m) => ({ default: m.BackupList })))
const SSLManager = lazy(() => import('@/pages/ssl/SSLManager').then((m) => ({ default: m.SSLManager })))
const WordPressList = lazy(() => import('@/pages/wordpress/WordPressList').then((m) => ({ default: m.WordPressList })))
const ServerOverview = lazy(() => import('@/pages/servers/ServerOverview').then((m) => ({ default: m.ServerOverview })))
const CustomerList = lazy(() => import('@/pages/customers/CustomerList').then((m) => ({ default: m.CustomerList })))
const SettingsPage = lazy(() => import('@/pages/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
})

function PageLoader() {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="websites" element={<WebsiteList />} />
              <Route path="websites/create" element={<WebsiteCreate />} />
              <Route path="websites/:id" element={<WebsiteDetail />} />
              <Route path="domains" element={<DomainList />} />
              <Route path="domains/:domainId/dns" element={<DnsEditor />} />
              <Route path="email" element={<EmailList />} />
              <Route path="email/create" element={<EmailCreate />} />
              <Route path="databases" element={<DatabaseList />} />
              <Route path="databases/create" element={<DatabaseCreate />} />
              <Route path="ftp" element={<FtpList />} />
              <Route path="backups" element={<BackupList />} />
              <Route path="ssl" element={<SSLManager />} />
              <Route path="wordpress" element={<WordPressList />} />
              <Route path="servers" element={<ServerOverview />} />
              <Route path="customers" element={<CustomerList />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
      <Toaster theme="light" position="bottom-right" richColors />
    </QueryClientProvider>
  )
}
