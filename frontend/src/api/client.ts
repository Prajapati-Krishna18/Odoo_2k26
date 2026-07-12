import axios, { type InternalAxiosRequestConfig } from 'axios'

// Create axios instance
export const client = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

let isRefreshing = false
let refreshSubscribers: ((token: string) => void)[] = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token))
  refreshSubscribers = []
}

// Request Interceptor: Attach access token
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor: Handle token refresh on 401
client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const { config, response } = error
    const originalRequest = config

    // If unauthorized, attempt token refresh
    if (response && response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            resolve(client(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        isRefreshing = false
        // Trigger logout / clear storage
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
        return Promise.reject(error)
      }

      try {
        const refreshResponse = await axios.post('/api/auth/refresh-token', {
          refreshToken,
        })
        const newAccessToken = refreshResponse.data.data.accessToken
        localStorage.setItem('accessToken', newAccessToken)

        isRefreshing = false
        onRefreshed(newAccessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return client(originalRequest)
      } catch (refreshError) {
        isRefreshing = false
        // Refresh failed, clean up and redirect
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    // Extract message from backend standard response if possible
    const backendMessage = response?.data?.message || error.message
    const backendErrors = response?.data?.errors
    
    const enrichedError = new Error(backendMessage) as any
    enrichedError.status = response?.status
    enrichedError.errors = backendErrors
    enrichedError.response = response
    
    return Promise.reject(enrichedError)
  }
)
