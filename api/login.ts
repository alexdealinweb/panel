import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  const { email, password, token, action } = req.body || {}

  const apiUrl = process.env.ENHANCE_API_URL
  if (!apiUrl) {
    return res.status(500).json({ message: 'ENHANCE_API_URL is not configured' })
  }

  const normalizedUrl = apiUrl.replace(/\/+$/, '')

  // Resolve org membership (second call after login)
  if (action === 'resolve-org' && token) {
    try {
      const loginRes = await fetch(`${normalizedUrl}/login/info`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!loginRes.ok) {
        return res.status(loginRes.status).json({ message: 'Failed to get login info' })
      }

      const loginInfo = await loginRes.json()

      const membersRes = await fetch(`${normalizedUrl}/logins/${loginInfo.id}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (membersRes.ok) {
        const members = await membersRes.json()
        const items = members.items || members
        const ownerMember = Array.isArray(items)
          ? items.find((m: { roles?: string[] }) => m.roles?.includes('Owner')) || items[0]
          : null
        return res.json({ orgId: ownerMember?.orgId || '' })
      }

      return res.json({ orgId: '' })
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      return res.status(502).json({ message })
    }
  }

  // Primary login flow
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' })
  }

  try {
    const response = await fetch(`${normalizedUrl}/login/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      return res.status(response.status).json({
        message: body.message || body.error || `Authentication failed (${response.status})`,
      })
    }

    // Token comes in the Set-Cookie header as "id0=<jwt>"
    const setCookie = response.headers.get('set-cookie') || ''
    const tokenMatch = setCookie.match(/id0=([^;]+)/)
    const token = tokenMatch?.[1] || ''

    if (!token) {
      return res.status(502).json({ message: 'No session token in response' })
    }

    const data = await response.json()
    const memberships = data.memberships || []
    const orgId = memberships[0]?.orgId || ''

    return res.json({ token, apiUrl: normalizedUrl, orgId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return res.status(502).json({ message: `Cannot reach Enhance server: ${message}` })
  }
}
