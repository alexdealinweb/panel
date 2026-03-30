import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { system } from '@/api/enhance/endpoints'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Loader2, Globe, User, Key, Building2 } from 'lucide-react'

export function SettingsPage() {
  const { session, logout } = useAuth()
  const [testing, setTesting] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)
  const [version, setVersion] = useState<string | null>(null)

  const testConnection = async () => {
    setTesting(true)
    setConnected(null)
    try {
      const res = await system.testConnection()
      setConnected(true)
      setVersion(res.version)
      toast.success(`Connected! API version: ${res.version}`)
    } catch {
      setConnected(false)
      setVersion(null)
      toast.error('Connection failed.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Your current session and connection details.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>You are currently signed in to your Enhance panel.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {session && (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-muted-foreground"><Globe className="h-4 w-4" /> Server</span>
                <span className="font-mono text-xs">{session.apiUrl}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-muted-foreground"><User className="h-4 w-4" /> Email</span>
                <span>{session.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" /> Org ID</span>
                <span className="font-mono text-xs">{session.orgId || 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-muted-foreground"><Key className="h-4 w-4" /> Token</span>
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button variant="outline" onClick={testConnection} disabled={testing}>
              {testing && <Loader2 className="h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            {connected === true && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span className="text-sm text-emerald-500">Connected</span>
                {version && <Badge variant="secondary">v{version}</Badge>}
              </div>
            )}
            {connected === false && (
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm text-red-500">Failed</span>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <Button variant="destructive" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
