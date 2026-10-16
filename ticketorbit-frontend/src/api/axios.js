import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8081',
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const token = localStorage.getItem('token')
    const requestUrl = error.config?.url ?? ''

    const isLoginRequest = requestUrl.includes(
      '/api/v1/auth/login/public'
    )

      if (status === 401 && token && !isLoginRequest) {

      localStorage.removeItem('token')
      window.dispatchEvent(new Event('auth:unauthorized'))
    }

    return Promise.reject(error)
  }
)

export default api