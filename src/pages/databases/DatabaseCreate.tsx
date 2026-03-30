import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateDatabase } from '@/api/hooks/useDatabases'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const schema = z.object({
  name: z.string().min(1, 'Database name is required'),
  username: z.string().optional(),
  password: z.string().optional(),
  charset: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export function DatabaseCreate() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const websiteId = searchParams.get('websiteId') || ''
  const createMutation = useCreateDatabase(websiteId)
  const [showPassword, setShowPassword] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data, {
      onSuccess: () => navigate(`/databases?websiteId=${websiteId}`),
    })
  }

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Create Database</h1>
        <p className="text-muted-foreground">Add a new MySQL database.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Database Details</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Database Name</label>
              <Input placeholder="mydb" {...register('name')} />
              {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Username (optional)</label>
              <Input placeholder="dbuser" {...register('username')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password (optional)</label>
              <div className="flex gap-2">
                <Input type={showPassword ? 'text' : 'password'} {...register('password')} />
                <Button type="button" variant="outline" onClick={() => setShowPassword(!showPassword)} className="shrink-0">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Charset</label>
              <Select {...register('charset')}>
                <option value="utf8mb4">utf8mb4</option>
                <option value="utf8">utf8</option>
                <option value="latin1">latin1</option>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={createMutation.isPending}>{createMutation.isPending ? 'Creating...' : 'Create Database'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
