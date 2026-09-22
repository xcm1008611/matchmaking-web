import { post } from './request'
import type { LoginResult, UserInfo } from '@/types'

export const authApi = {
  login: (username: string, password: string) =>
    post<LoginResult>('/api/v1/auth/login', { username, password }),
  profile: () => post<UserInfo>('/api/v1/auth/profile')
}
