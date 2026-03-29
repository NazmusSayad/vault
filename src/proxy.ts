import { SESSION_COOKIE_NAME } from '@/server/constants'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = Boolean(request.cookies.get(SESSION_COOKIE_NAME)?.value)

  if (hasSession && pathname === '/') {
    return NextResponse.redirect(new URL('/vault', request.url))
  }

  if (!hasSession && pathname === '/vault') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  if (!hasSession && pathname === '/home') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/vault', '/home'],
}
