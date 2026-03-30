import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateWebsite } from '@/api/hooks/useWebsites'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

const schema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  phpVersion: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function WebsiteCreate() {
  const navigate = useNavigate()
  const createMutation = useCreateWebsite()
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate('/websites'),
    })
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Website</h1>
        <p className="text-muted-foreground">Add a new website to your hosting.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Website Details</CardTitle>
          <CardDescription>Enter the details for your new website.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Domain</label>
              <Input placeholder="example.com" {...register('domain')} />
              {errors.domain && <p className="text-sm text-red-500">{errors.domain.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">PHP Version</label>
              <Select {...register('phpVersion')}>
                <option value="">Default</option>
                <option value="8.3">PHP 8.3</option>
                <option value="8.2">PHP 8.2</option>
                <option value="8.1">PHP 8.1</option>
                <option value="8.0">PHP 8.0</option>
                <option value="7.4">PHP 7.4</option>
              </Select>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Creating...' : 'Create Website'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/websites')}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
