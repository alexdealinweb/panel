import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateMailbox } from '@/api/hooks/useEmails'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  address: z.string().min(1, 'Email address is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  quotaMb: z.number().optional(),
})

type FormData = z.infer<typeof schema>

export function EmailCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''
  const createMutation = useCreateMailbox(websiteId)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate(`/email?websiteId=${websiteId}`),
    })
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Mailbox</h1>
        <p className="text-muted-foreground">Add a new email account.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Mailbox Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email Address</label>
              <Input placeholder="user@example.com" {...register('address')} />
              {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <div className="flex gap-2">
                <Input type={showPassword ? 'text' : 'password'} placeholder="Minimum 6 characters" {...register('password')} />
                <Button type="button" variant="outline" onClick={() => setShowPassword(!showPassword)} className="shrink-0">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Quota (MB)</label>
              <Input type="number" placeholder="1024" {...register('quotaMb')} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create Mailbox'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
