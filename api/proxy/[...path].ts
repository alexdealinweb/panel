import type { VercelRequest, VercelResponse } from '@vercel/node'

const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiUrl = process.env.ENHANCE_API_URL
  const apiKey = process.env.ENHANCE_API_KEY
  const isReadOnly = process.env.ENHANCE_READ_ONLY !== 'false'

  if (!apiUrl || !apiKey) {
    return res.status(503).json({
      error: 'Server not configured',
      message: 'Set ENHANCE_API_URL and ENHANCE_API_KEY in Vercel environment variables.',
    })
  }

  if (isReadOnly && WRITE_METHODS.has(req.method || '')) {
    return res.status(403).json({
      error: 'Read-only mode',
      message: `${req.method} requests are blocked. Set ENHANCE_READ_ONLY=false in environment variables to allow writes.`,
    })
  }

  const pathSegments = req.query.path
  const path = Array.isArray(pathSegments) ? pathSegments.join('/') : pathSegments || ''
  const qs = req.url?.includes('?') ? '?' + req.url.split('?').slice(1).join('?').replace(/(&?)path=[^&]*/, '') : ''
  const targetUrl = `${apiUrl.replace(/\/$/, '')}/${path}${qs}`

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
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
