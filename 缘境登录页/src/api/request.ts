import axios from 'axios'
import type { ApiResponse } from '@/types'

const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/',
  timeout: 60000
})

service.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

service.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || '网络异常, 请检查网络连接'
    return Promise.reject(new Error(message))
  }
)

export function post<T = unknown>(url: string, data?: object): Promise<ApiResponse<T>> {
  return service.post(url, data).then((response) => response.data as ApiResponse<T>)
}

export default service
