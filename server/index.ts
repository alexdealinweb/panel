import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const port = process.env.PORT || 3001

const isReadOnly = process.env.ENHANCE_READ_ONLY !== 'false'
const WRITE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

app.use(cors())
app.use(express.json())

// Status endpoint — tells the frontend the current server config (no secrets)
app.get('/api/status', (_req, res) => {
  const apiUrl = process.env.ENHANCE_API_URL || ''
  const apiKey = process.env.ENHANCE_API_KEY || ''
  const orgId = process.env.ENHANCE_ORG_ID || ''

  res.json({
    configured: !!(apiUrl && apiKey),
    apiUrl: apiUrl ? apiUrl.replace(/^(https?:\/\/[^/]+).*/, '$1') : '',
    hasKey: !!apiKey,
    orgId,
    readOnly: isReadOnly,
  })
})

// Proxy — credentials come ONLY from .env, never from the browser
app.all('/api/proxy/*', async (req, res) => {
  const apiUrl = process.env.ENHANCE_API_URL
  const apiKey = process.env.ENHANCE_API_KEY

  if (!apiUrl || !apiKey) {
    res.status(503).json({
      error: 'Server not configured',
      message: 'Set ENHANCE_API_URL and ENHANCE_API_KEY in the server .env file.',
    })
    return
  }

  // Read-only guard: block all write operations
  if (isReadOnly && WRITE_METHODS.has(req.method)) {
    res.status(403).json({
      error: 'Read-only mode',
      message: `${req.method} requests are blocked. The server is in read-only mode (ENHANCE_READ_ONLY=true in .env). This protects your live data from accidental changes.`,
    })
    return
  }

  const path = req.params[0] || ''
  const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : ''
  const targetUrl = `${apiUrl.replace(/\/$/, '')}/${path}${queryString}`

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    }

    const fetchOptions: RequestInit = {
      method: req.method,
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
})

app.listen(port, () => {
  console.log(``)
  console.log(`  EnhanceUI proxy running on port ${port}`)
  console.log(`  API URL:   ${process.env.ENHANCE_API_URL ? '✓ configured' : '✗ not set'}`)
  console.log(`  API Key:   ${process.env.ENHANCE_API_KEY ? '✓ configured' : '✗ not set'}`)
  console.log(`  Org ID:    ${process.env.ENHANCE_ORG_ID || '(not set)'}`)
  console.log(`  Read-Only: ${isReadOnly ? '✓ ON — write operations blocked' : '✗ OFF — writes allowed!'}`)
  console.log(``)
})
