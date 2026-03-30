import type { VercelRequest, VercelResponse } from '@vercel/node'

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const apiUrl = process.env.ENHANCE_API_URL || ''
  const apiKey = process.env.ENHANCE_API_KEY || ''
  const orgId = process.env.ENHANCE_ORG_ID || ''
  const isReadOnly = process.env.ENHANCE_READ_ONLY !== 'false'

  res.json({
    configured: !!(apiUrl && apiKey),
    apiUrl: apiUrl ? apiUrl.replace(/^(https?:\/\/[^/]+).*/, '$1') : '',
    hasKey: !!apiKey,
    orgId,
    readOnly: isReadOnly,
  })
}
