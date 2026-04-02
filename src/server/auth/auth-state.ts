import 'server-only'

import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import {
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
