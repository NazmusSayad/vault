import 'server-only'

import { serverEnv } from '@/env.server'
import type { PendingAuthState } from '@/server/auth/types'
import ms, { type StringValue } from 'ms'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const sessionCookieName = 'vault-app-session'
const pendingAuthCookieName = 'vault-workos-pending-auth'
const sessionMaxAge = ms(serverEnv.APP_SESSION_TTL as StringValue)
const secureCookies = serverEnv.APP_URL.startsWith('https://')

if (typeof sessionMaxAge !== 'number') {
  throw new Error('APP_SESSION_TTL must be a valid duration.')
}

const sessionMaxAgeInSeconds = Math.floor(sessionMaxAge / 1000)

export async function getSessionCookieValue() {
  const cookieStore = await cookies()

  return cookieStore.get(sessionCookieName)?.value ?? ''
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()

  cookieStore.set({
    name: sessionCookieName,
    value: token,
    httpOnly: true,
    maxAge: sessionMaxAgeInSeconds,
    path: '/',
    sameSite: 'lax',
    secure: secureCookies,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.set({
    name: sessionCookieName,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: secureCookies,
  })
}

export function setResponseSessionCookie(
  response: NextResponse,
  token: string
) {
  response.cookies.set({
    name: sessionCookieName,
    value: token,
    httpOnly: true,
    maxAge: sessionMaxAgeInSeconds,
    path: '/',
    sameSite: 'lax',
    secure: secureCookies,
  })
}

export async function getPendingAuthState() {
  const cookieStore = await cookies()
  const value = cookieStore.get(pendingAuthCookieName)?.value

  if (!value) {
    return null
  }

  try {
    const parsed = JSON.parse(value)

    if (
      parsed &&
      typeof parsed === 'object' &&
      parsed.mode === 'email-verification' &&
      typeof parsed.email === 'string' &&
      typeof parsed.pendingAuthenticationToken === 'string' &&
      (parsed.name === undefined || typeof parsed.name === 'string')
    ) {
      return {
        mode: parsed.mode,
        email: parsed.email,
        name: parsed.name,
        pendingAuthenticationToken: parsed.pendingAuthenticationToken,
      } satisfies PendingAuthState
    }
  } catch {}

  return null
}

export async function setPendingAuthState(state: PendingAuthState) {
  const cookieStore = await cookies()

  cookieStore.set({
    name: pendingAuthCookieName,
    value: JSON.stringify(state),
    httpOnly: true,
    maxAge: 60 * 10,
    path: '/',
    sameSite: 'lax',
    secure: secureCookies,
  })
}

export async function clearPendingAuthState() {
  const cookieStore = await cookies()

  cookieStore.set({
    name: pendingAuthCookieName,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: secureCookies,
  })
}

export function clearResponsePendingAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: pendingAuthCookieName,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: secureCookies,
  })
}
