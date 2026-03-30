import axios, { type AxiosRequestConfig } from 'axios'

export type AppMode = 'live' | 'demo'

let currentMode: AppMode = (localStorage.getItem('enhance_mode') as AppMode) || 'demo'
let cachedOrgId: string = ''

export function getMode(): AppMode {
  return currentMode
}

export function setMode(mode: AppMode) {
  currentMode = mode
  localStorage.setItem('enhance_mode', mode)
}

const proxyClient = axios.create({
  baseURL: '/api/proxy',
})

export async function apiRequest<T>(
  method: string,
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  if (currentMode === 'demo') {
    const { handleDemoRequest } = await import('./demo')
    return handleDemoRequest<T>(method, path, data)
  }

  const response = await proxyClient.request<T>({
    method,
    url: path,
    data,
    ...config,
  })
  return response.data
}

export function getOrgId(): string {
  return cachedOrgId || 'demo-org'
}

export function setOrgId(id: string) {
  cachedOrgId = id
}

export async function fetchServerStatus(): Promise<{
  configured: boolean
  apiUrl: string
  hasKey: boolean
  orgId: string
}> {
  const res = await axios.get('/api/status')
  if (res.data.orgId) {
    cachedOrgId = res.data.orgId
  }
  return res.data
}

export { proxyClient }
