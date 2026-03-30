import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { system } from '@/api/enhance/endpoints'
import { getMode, setMode, fetchServerStatus, type AppMode } from '@/api/enhance/client'
import { toast } from 'sonner'
import { CheckCircle2, XCircle, Loader2, Shield, ShieldAlert, FlaskConical } from 'lucide-react'

export function SettingsPage() {
  const [testing, setTesting] = useState(false)
  const [connected, setConnected] = useState<boolean | null>(null)
  const [version, setVersion] = useState<string | null>(null)
  const [mode, setModeLocal] = useState<AppMode>(getMode())
  const [serverStatus, setServerStatus] = useState<{
    configured: boolean
    apiUrl: string
    hasKey: boolean
    orgId: string
    readOnly?: boolean
  } | null>(null)

  useEffect(() => {
    fetchServerStatus().then(setServerStatus).catch(() => {})
  }, [])

  const switchMode = (newMode: AppMode) => {
    setMode(newMode)
    setModeLocal(newMode)
    setConnected(null)
    setVersion(null)
    toast.success(newMode === 'demo' ? 'Switched to Demo mode — using fake data' : 'Switched to Live mode — connecting to real API')
    // Force reload queries
    window.location.reload()
  }

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
      toast.error('Connection failed. Check server .env configuration.')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure how EnhanceUI connects to your Enhance panel.</p>
      </div>

      {/* Mode selector */}
      <Card>
        <CardHeader>
          <CardTitle>Mode</CardTitle>
          <CardDescription>Choose how EnhanceUI works.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => switchMode('demo')}
              className={`flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors ${mode === 'demo' ? 'border-blue-500 bg-blue-500/5' : 'border-border hover:border-muted-foreground/30'}`}
            >
              <div className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Demo Mode</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Fake data, no API connection. Safe to explore the UI without any risk.
              </p>
            </button>

            <button
              onClick={() => switchMode('live')}
              className={`flex flex-col items-start gap-2 rounded-lg border-2 p-4 text-left transition-colors ${mode === 'live' ? 'border-emerald-500 bg-emerald-500/5' : 'border-border hover:border-muted-foreground/30'}`}
            >
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold">Live Mode</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connects to real Enhance API. Credentials configured in server <code className="text-xs bg-muted px-1 rounded">.env</code> file.
              </p>
            </button>
          </div>

          {mode === 'demo' && (
            <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3 text-sm">
              <FlaskConical className="h-4 w-4 inline mr-1.5 text-blue-500" />
              Demo mode active — all data is fake. No real API calls are made.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Server status — only shown in live mode */}
      {mode === 'live' && (
        <Card>
          <CardHeader>
            <CardTitle>Server Configuration</CardTitle>
            <CardDescription>
              API credentials are stored in the server <code className="text-xs bg-muted px-1 rounded">.env</code> file — they never reach your browser.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {serverStatus ? (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">API URL</span>
                  <span className="font-mono">{serverStatus.apiUrl || 'Not configured'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">API Key</span>
                  {serverStatus.hasKey
                    ? <Badge variant="success">Configured</Badge>
                    : <Badge variant="destructive">Missing</Badge>
                  }
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Org ID</span>
                  <span className="font-mono">{serverStatus.orgId || 'Not set'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Write Protection</span>
                  {serverStatus.readOnly
                    ? <Badge variant="success"><Shield className="h-3 w-3 mr-1" /> Read-Only</Badge>
                    : <Badge variant="warning"><ShieldAlert className="h-3 w-3 mr-1" /> Writes Allowed</Badge>
                  }
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Unable to reach proxy server. Is it running on port 3001?</p>
            )}

            {serverStatus?.readOnly && (
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-sm">
                <Shield className="h-4 w-4 inline mr-1.5 text-emerald-500" />
                <strong>Read-Only mode is ON.</strong> All write operations (create, update, delete) are blocked at the server level.
                To allow writes, set <code className="text-xs bg-muted px-1 rounded">ENHANCE_READ_ONLY=false</code> in <code className="text-xs bg-muted px-1 rounded">.env</code> and restart the server.
              </div>
            )}

            {serverStatus && !serverStatus.readOnly && (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-sm">
                <ShieldAlert className="h-4 w-4 inline mr-1.5 text-amber-500" />
                <strong>Write operations are allowed.</strong> Be careful — actions like deleting websites, databases, and emails will affect real data.
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

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                To change credentials, edit the file <code className="bg-muted px-1 rounded">enhance-ui/.env</code> and restart the server.
                API keys never leave the server process.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How-to */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Guide</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-muted-foreground">
          <p><strong className="text-foreground">1.</strong> Copy <code className="bg-muted px-1 rounded">.env.example</code> to <code className="bg-muted px-1 rounded">.env</code></p>
          <p><strong className="text-foreground">2.</strong> Fill in <code className="bg-muted px-1 rounded">ENHANCE_API_URL</code>, <code className="bg-muted px-1 rounded">ENHANCE_API_KEY</code>, and <code className="bg-muted px-1 rounded">ENHANCE_ORG_ID</code></p>
          <p><strong className="text-foreground">3.</strong> Leave <code className="bg-muted px-1 rounded">ENHANCE_READ_ONLY=true</code> until you're confident</p>
          <p><strong className="text-foreground">4.</strong> Restart with <code className="bg-muted px-1 rounded">npm run dev</code></p>
          <p><strong className="text-foreground">5.</strong> Switch to Live mode here and test the connection</p>
        </CardContent>
      </Card>
    </div>
  )
}
