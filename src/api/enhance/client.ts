import axios, { type AxiosRequestConfig } from 'axios'

let cachedOrgId = ''
let cachedToken = ''
let cachedApiUrl = ''

const proxyClient = axios.create({
  baseURL: '/api/proxy',
})

// Attach token + apiUrl on every request
proxyClient.interceptors.request.use((config) => {
  if (cachedToken) {
    config.headers['X-Enhance-Token'] = cachedToken
  }
  if (cachedApiUrl) {
    config.headers['X-Enhance-Url'] = cachedApiUrl
  }
  return config
})

// On 401, clear session and redirect to login
proxyClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('enhance_session')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function configureClient(token: string, apiUrl: string, orgId: string) {
  cachedToken = token
  cachedApiUrl = apiUrl
  cachedOrgId = orgId
}

export function resetClient() {
  cachedToken = ''
  cachedApiUrl = ''
  cachedOrgId = ''
}

export async function apiRequest<T>(
  method: string,
  path: string,
  data?: unknown,
  config?: AxiosRequestConfig
): Promise<T> {
  const response = await proxyClient.request<T>({
    method,
    url: path,
    data,
    ...config,
  })
  return response.data
}

export function getOrgId(): string {
  return cachedOrgId
}

export function setOrgId(id: string) {
  cachedOrgId = id
}

// Restore session from localStorage on module load
function restoreSession() {
  try {
    const raw = localStorage.getItem('enhance_session')
    if (!raw) return
    const session = JSON.parse(raw)
    if (session.token && session.apiUrl) {
      configureClient(session.token, session.apiUrl, session.orgId || '')
    }
  } catch {
    // ignore
  }
}

restoreSession()

export { proxyClient }
