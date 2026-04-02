import { serverEnv } from '@/env.server'
import ms from 'ms'

export const SESSION_COOKIE_NAME = 'vault-app-session'

export const SESSION_MAX_AGE = ms('30d')
export const SESSION_MAX_AGE_SECONDS = Math.floor(SESSION_MAX_AGE / 1000)
export const SECURE_COOKIES = serverEnv.APP_URL.startsWith('https://')
