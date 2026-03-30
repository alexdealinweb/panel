import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCreateWebsite } from '@/api/hooks/useWebsites'
import { useServers } from '@/api/hooks/useServers'
import { subscriptions, installableApps, websiteApps } from '@/api/enhance/endpoints'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { FileBox, AppWindow, Copy, ChevronDown, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'

type WebsiteKind = 'scratch' | 'app' | 'clone'

const baseSchema = z.object({
  domain: z.string().min(1, 'Domain is required').regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/, 'Enter a valid domain (e.g. example.com)'),
})

const appSchema = baseSchema.extend({
  app: z.string().min(1),
  appVersion: z.string().min(1),
  adminUsername: z.string().min(1, 'Username is required'),
  adminEmail: z.string().email('Valid email required'),
  adminPassword: z
    .string()
    .min(10, 'Minimum 10 characters')
    .regex(/[a-z]/, 'One lowercase character')
    .regex(/[A-Z]/, 'One uppercase character')
    .regex(/[0-9]/, 'One number')
    .regex(/[^a-zA-Z0-9]/, 'One special character'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
}).refine((d) => d.adminPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type BaseFormData = z.infer<typeof baseSchema>
type AppFormData = z.infer<typeof appSchema>

const kindOptions: { value: WebsiteKind; icon: typeof FileBox; title: string; description: string }[] = [
  { value: 'scratch', icon: FileBox, title: 'Start from scratch', description: 'Get started with a blank web space.' },
  { value: 'app', icon: AppWindow, title: 'Install an app', description: 'Install popular apps onto your website in just a few clicks' },
  { value: 'clone', icon: Copy, title: 'Clone website', description: 'Make a carbon copy of one of your existing websites.' },
]

const passwordRules = [
  { label: 'One lowercase character', regex: /[a-z]/ },
  { label: 'One uppercase character', regex: /[A-Z]/ },
  { label: 'One number', regex: /[0-9]/ },
  { label: 'One special character', regex: /[^a-zA-Z0-9]/ },
  { label: '10 characters minimum', test: (v: string) => v.length >= 10 },
]

export function AddWebsiteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const createMutation = useCreateWebsite()
  const { data: serversData } = useServers()
  const { data: subsData } = useQuery({
    queryKey: ['subscriptions'],
    queryFn: () => subscriptions.list(),
    staleTime: 30_000,
  })
  const { data: appsData } = useQuery({
    queryKey: ['installable-apps'],
    queryFn: () => installableApps.list(),
    staleTime: 60_000,
  })

  const installAppMutation = useMutation({
    mutationFn: ({ websiteId, data }: { websiteId: string; data: Parameters<typeof websiteApps.install>[1] }) =>
      websiteApps.install(websiteId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['websites'] })
      toast.success('Website created with app installed')
    },
    onError: (e: Error) => toast.error(`App install failed: ${e.message}`),
  })

  const [kind, setKind] = useState<WebsiteKind>('scratch')
  const [showPlacement, setShowPlacement] = useState(false)
  const [selectedServer, setSelectedServer] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const schema = kind === 'app' ? appSchema : baseSchema
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<AppFormData>({
    resolver: zodResolver(schema),
    defaultValues: { app: 'wordpress', appVersion: '', adminUsername: '', adminEmail: '', adminPassword: '', confirmPassword: '' },
  })

  const servers = serversData?.items || []
  const activeSub = subsData?.items?.find((s) => s.status === 'active')
  const apps = appsData?.items || []
  const uniqueApps = [...new Set(apps.map((a) => a.app))]
  const selectedApp = watch('app') || 'wordpress'
  const appVersions = apps.filter((a) => a.app === selectedApp)
  const passwordValue = watch('adminPassword') || ''

  // Set default version to latest when apps load or app changes
  const currentVersion = watch('appVersion')
  useEffect(() => {
    if (appVersions.length > 0 && !currentVersion) {
      const latest = appVersions.find((v) => v.isLatest) || appVersions[0]
      setValue('appVersion', latest.version)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appVersions.length, currentVersion])

  const isPending = createMutation.isPending || installAppMutation.isPending

  const onSubmit = (data: BaseFormData | AppFormData) => {
    createMutation.mutate(
      {
        domain: data.domain,
        subscriptionId: activeSub?.id,
        ...(selectedServer && { appServerId: selectedServer }),
      },
      {
        onSuccess: (result) => {
          if (kind === 'app' && 'adminUsername' in data) {
            const websiteId = (result as { id: string }).id
            installAppMutation.mutate({
              websiteId,
              data: {
                app: data.app,
                version: data.appVersion,
                adminUsername: data.adminUsername,
                adminPassword: data.adminPassword,
                adminEmail: data.adminEmail,
              },
            }, {
              onSuccess: () => {
                resetForm()
                onOpenChange(false)
              },
            })
          } else {
            resetForm()
            onOpenChange(false)
          }
        },
      },
    )
  }

  const resetForm = () => {
    reset()
    setKind('scratch')
    setSelectedServer('')
    setShowPlacement(false)
    setShowPassword(false)
    setShowConfirm(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-normal">Add website</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4">
          {/* Website kind selection */}
          <div className="grid grid-cols-3 gap-3">
            {kindOptions.map((opt) => {
              const Icon = opt.icon
              const selected = kind === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setKind(opt.value)}
                  className={cn(
                    'relative flex flex-col items-center gap-3 rounded-lg border-2 p-6 text-center transition-colors',
                    selected ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30',
                  )}
                >
                  {selected && (
                    <div className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      ✓
                    </div>
                  )}
                  <Icon className={cn('h-12 w-12', selected ? 'text-foreground' : 'text-muted-foreground/60')} strokeWidth={1} />
                  <div>
                    <p className="font-medium text-sm">{opt.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{opt.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Domain input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Domain*</label>
            <div className="flex items-center gap-0">
              <span className="flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-sm text-muted-foreground">
                www.
              </span>
              <Input className="rounded-l-none" placeholder="example.com" {...register('domain')} />
            </div>
            {errors.domain && <p className="text-sm text-destructive">{errors.domain.message}</p>}
          </div>

          {/* Server placement (collapsible) */}
          <div>
            <button
              type="button"
              onClick={() => setShowPlacement(!showPlacement)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Server placement
              <ChevronDown className={cn('h-4 w-4 transition-transform', showPlacement && 'rotate-180')} />
            </button>
            {showPlacement && servers.length > 0 && (
              <div className="mt-3">
                <Select value={selectedServer} onChange={(e) => setSelectedServer(e.target.value)}>
                  <option value="">Auto (recommended)</option>
                  {servers.map((s) => (
                    <option key={s.id} value={s.id}>{s.friendlyName || s.hostname || s.id}</option>
                  ))}
                </Select>
              </div>
            )}
          </div>

          {/* App install section — only when "Install an app" is selected */}
          {kind === 'app' && (
            <>
              <hr className="border-border" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Application*</label>
                  <Select {...register('app')}>
                    {uniqueApps.map((app) => (
                      <option key={app} value={app}>
                        {app.charAt(0).toUpperCase() + app.slice(1)}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Version*</label>
                  <Select {...register('appVersion')}>
                    {appVersions.map((v) => (
                      <option key={v.version} value={v.version}>
                        {v.version}{v.isLatest ? ' (Latest)' : ''}
                      </option>
                    ))}
                  </Select>
                  {'appVersion' in errors && errors.appVersion && (
                    <p className="text-sm text-destructive">{errors.appVersion.message}</p>
                  )}
                </div>
              </div>

              <hr className="border-border" />

              <div>
                <h3 className="text-base font-semibold">WordPress admin account</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You will use these credentials to log in and manage your application.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username*</label>
                  <Input {...register('adminUsername')} />
                  {'adminUsername' in errors && errors.adminUsername && (
                    <p className="text-sm text-destructive">{errors.adminUsername.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email address*</label>
                  <Input type="email" {...register('adminEmail')} />
                  {'adminEmail' in errors && errors.adminEmail && (
                    <p className="text-sm text-destructive">{errors.adminEmail.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password*</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      className="pr-10"
                      {...register('adminPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {'adminPassword' in errors && errors.adminPassword && (
                    <p className="text-sm text-destructive">{errors.adminPassword.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Confirm password*</label>
                  <div className="relative">
                    <Input
                      type={showConfirm ? 'text' : 'password'}
                      className="pr-10"
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {'confirmPassword' in errors && errors.confirmPassword && (
                    <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              <ul className="space-y-1 text-sm">
                {passwordRules.map((rule) => {
                  const passed = 'regex' in rule
                    ? rule.regex.test(passwordValue)
                    : rule.test(passwordValue)
                  return (
                    <li key={rule.label} className="flex items-center gap-2">
                      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', passed ? 'bg-green-500' : 'bg-muted-foreground/40')} />
                      <span className={passed ? 'text-foreground' : 'text-muted-foreground'}>{rule.label}</span>
                    </li>
                  )
                })}
              </ul>
            </>
          )}

          {/* Footer */}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Adding...' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
