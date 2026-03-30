import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Login endpoint — proxies credentials to Enhance API and returns token
app.post('/api/login', async (req, res) => {
  const { email, password, token, action } = req.body

  const apiUrl = process.env.ENHANCE_API_URL
  if (!apiUrl) {
    res.status(500).json({ message: 'ENHANCE_API_URL is not configured' })
    return
  }

  const normalizedUrl = apiUrl.replace(/\/+$/, '')

  // Resolve org membership (second call after login)
  if (action === 'resolve-org' && token) {
    try {
      // Get current login info
      const loginRes = await fetch(`${normalizedUrl}/login/info`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!loginRes.ok) {
        res.status(loginRes.status).json({ message: 'Failed to get login info' })
        return
      }

      const loginInfo = await loginRes.json()

      // Get memberships to find the orgId
      const membersRes = await fetch(`${normalizedUrl}/logins/${loginInfo.id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (membersRes.ok) {
        const members = await membersRes.json()
        const items = members.items || members
        // Pick the first Owner-role membership, or just the first one
        const ownerMember = Array.isArray(items)
          ? items.find((m: { roles?: string[] }) => m.roles?.includes('Owner')) || items[0]
          : null
        res.json({ orgId: ownerMember?.orgId || '' })
        return
      }

      res.json({ orgId: '' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      res.status(502).json({ message })
    }
    return
  }

  // Primary login flow
  if (!email || !password) {
    res.status(400).json({ message: 'Email and password are required' })
    return
  }

  try {
    const response = await fetch(`${normalizedUrl}/login/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      res.status(response.status).json({
        message: body.message || body.error || `Authentication failed (${response.status})`,
      })
      return
    }

    // Token comes in the Set-Cookie header as "id0=<jwt>"
    const setCookie = response.headers.get('set-cookie') || ''
    const tokenMatch = setCookie.match(/id0=([^;]+)/)
    const token = tokenMatch?.[1] || ''

    if (!token) {
      res.status(502).json({ message: 'No session token in response' })
      return
    }

    const data = await response.json()
    const memberships = data.memberships || []
    const orgId = memberships[0]?.orgId || ''

    res.json({ token, apiUrl: normalizedUrl, orgId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    res.status(502).json({ message: `Cannot reach Enhance server: ${message}` })
  }
})

// Status endpoint — lightweight health check
app.get('/api/status', (_req, res) => {
  res.json({ ok: true })
})

// Proxy — forwards request to Enhance API using token from client headers
app.all('/api/proxy/*path', async (req, res) => {
  const token = req.headers['x-enhance-token'] as string
  const apiUrl = req.headers['x-enhance-url'] as string

  if (!token || !apiUrl) {
    res.status(401).json({
      error: 'Not authenticated',
      message: 'Missing authentication token or API URL.',
    })
    return
  }

  const rawPath = (req.params as Record<string, string | string[]>)['path'] || ''
  const path = Array.isArray(rawPath) ? rawPath.join('/') : rawPath.replace(/,/g, '/')
  const queryString = req.url.includes('?') ? '?' + req.url.split('?')[1] : ''
  const targetUrl = `${apiUrl.replace(/\/$/, '')}/${path}${queryString}`

  console.log(`[proxy] ${req.method} ${targetUrl}${req.method !== 'GET' ? ' body=' + JSON.stringify(req.body) : ''}`)

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cookie': `id0=${token}`,
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

    if (!response.ok) {
      console.log(`[proxy] ← ${response.status} ${targetUrl}`)
    }

    res.status(response.status)

    if (contentType.includes('application/json')) {
      const data = await response.json()
      if (!response.ok) console.log(`[proxy] ← body:`, JSON.stringify(data))
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
  console.log(`  Auth mode: user login (no hardcoded API key)`)
  console.log(``)
})
