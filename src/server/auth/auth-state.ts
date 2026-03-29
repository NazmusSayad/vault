import 'server-only'

import type { PendingAuthState } from '@/server/auth/types'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
  PENDING_AUTH_COOKIE_NAME,
  SECURE_COOKIES,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
} from '../constants'

export async function getSessionCookieValue() {
  const cookieStore = await cookies()

  return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? ''
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies()

  cookieStore.set({
    value: token,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    name: SESSION_COOKIE_NAME,
    secure: SECURE_COOKIES,
    maxAge: SESSION_MAX_AGE_SECONDS,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()

  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: SECURE_COOKIES,
  })
}

export function setResponseSessionCookie(
  response: NextResponse,
  token: string
) {
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
    sameSite: 'lax',
    secure: SECURE_COOKIES,
  })
}

export async function getPendingAuthState() {
  const cookieStore = await cookies()
  const value = cookieStore.get(PENDING_AUTH_COOKIE_NAME)?.value

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
    name: PENDING_AUTH_COOKIE_NAME,
    value: JSON.stringify(state),
    httpOnly: true,
    maxAge: 60 * 10,
    path: '/',
    sameSite: 'lax',
    secure: SECURE_COOKIES,
  })
}

export async function clearPendingAuthState() {
  const cookieStore = await cookies()

  cookieStore.set({
    name: PENDING_AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: SECURE_COOKIES,
  })
}

export function clearResponsePendingAuthCookie(response: NextResponse) {
  response.cookies.set({
    name: PENDING_AUTH_COOKIE_NAME,
    value: '',
    httpOnly: true,
    maxAge: 0,
    path: '/',
    sameSite: 'lax',
    secure: SECURE_COOKIES,
  })
}
