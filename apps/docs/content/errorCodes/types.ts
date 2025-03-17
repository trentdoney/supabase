type SERVICE = 'AUTH' | 'REALTIME' | 'STORAGE'

export interface ErrorCode {
  code: string
  service: SERVICE
  httpStatus?: number
  message?: string
  paths?: string[]
}
