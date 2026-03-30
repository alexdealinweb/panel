import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const token = req.headers['x-enhance-token'] as string
  const apiUrl = req.headers['x-enhance-url'] as string

  if (!token || !apiUrl) {
    return res.status(401).json({
      error: 'Not authenticated',
      message: 'Missing authentication token or API URL.',
    })
  }

  const pathSegments = req.query.path
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments || ''
  const qs = req.url?.includes('?') ? '?' + req.url.split('?').slice(1).join('?').replace(/(&?)path=[^&]*/, '') : ''
  const targetUrl = `${apiUrl.replace(/\/$/, '')}/${path}${qs}`

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': `id0=${token}`,
    }

    const fetchOptions: RequestInit = {
      method: req.method || 'GET',
      headers,
    }

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      fetchOptions.body = JSON.stringify(req.body)
    }

    const response = await fetch(targetUrl, fetchOptions)
    const contentType = response.headers.get('content-type') || ''

    res.status(response.status)

    if (contentType.includes('application/json')) {
      const data = await response.json()
      res.json(data)
    } else {
      const text = await response.text()
      res.send(text)
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(502).json({ error: 'Proxy error', message })
  }
}
