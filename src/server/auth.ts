import 'server-only'

import { serverEnv } from '@/env.server'
import { prisma } from '@/server/.db'
import {
  getDefaultName,
  getErrorDetails,
  getFriendlyAuthErrorMessage,
  getPathnameWithSearch,
  getRequestMetadataFromHeaders,
} from '@/server/auth-helpers'
import {
  WorkOS,
  type AuthenticateWithSessionCookieFailureReason,
  type AuthenticationResponse,
  type User,
} from '@workos-inc/node'
import { cookies, headers } from 'next/headers'
import { NextResponse } from 'next/server'

const sessionCookieName = 'vault-workos-session'
const pendingAuthCookieName = 'vault-workos-pending-auth'
const secureCookies = serverEnv.APP_URL.startsWith('https://')

const workos = new WorkOS(serverEnv.WORKOS_API_KEY, {
  clientId: serverEnv.WORKOS_CLIENT_ID,
})

export type PendingAuthState = {
  mode: 'email-verification'
  email: string
  name?: string
  pendingAuthenticationToken: string
}

export type AuthMode =
  | 'forgot-password'
  | 'reset-password'
  | 'sign-in'
  | 'sign-up'
  | 'verify-email'

export type AuthActionState = {
  error?: string
  notice?: string
  pendingEmail?: string
}

function getAbsoluteUrl(pathname = '/') {
  return new URL(pathname, serverEnv.APP_URL)
}

function getRequestMetadata(request: Request) {
  return getRequestMetadataFromHeaders(request.headers)
}

export async function getCurrentRequestMetadata() {
  return getRequestMetadataFromHeaders(await headers())
}

export function getSafeReturnTo(value?: string | null) {
  if (!value?.startsWith('/')) {
    return '/'
  }

  return value
}

function setResponseSessionCookie(
  response: NextResponse,
  sealedSession: string
) {
  response.cookies.set({
    name: sessionCookieName,
    value: sealedSession,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: secureCookies,
  })
}

async function setSessionCookieValue(sealedSession: string) {
  const cookieStore = await cookies()

  cookieStore.set({
    name: sessionCookieName,
    value: sealedSession,
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: secureCookies,
  })
}

async function clearSessionCookieValue() {
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

async function setPendingAuthCookieValue(state: PendingAuthState) {
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

function clearResponsePendingAuthCookie(response: NextResponse) {
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

async function clearPendingAuthCookieValue() {
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

function getCallbackUrl() {
  return getAbsoluteUrl('/auth/callback').toString()
}

async function findOrCreateAppUser(user: User, preferredName?: string) {
  const existingUser = await prisma.user.findUnique({
    where: { workosUserId: user.id },
  })

  if (existingUser) {
    return existingUser
  }

  return prisma.user.create({
    data: {
      name: preferredName?.trim() || getDefaultName(user),
      workosUserId: user.id,
    },
  })
}

export async function getCurrentAppUser() {
  const authentication = await getSessionAuthentication()

  if (!authentication.authenticated) {
    return authentication
  }

  const appUser = await findOrCreateAppUser(authentication.user)

  return {
    ...authentication,
    appUser,
  }
}

export async function getCurrentSessionUser() {
  const currentUser = await getCurrentAppUser()

  if (currentUser.authenticated) {
    return currentUser
  }

  if (!shouldRefreshSession(currentUser.reason)) {
    return null
  }

  const cookieStore = await cookies()
  const session = workos.userManagement.loadSealedSession({
    sessionData: cookieStore.get(sessionCookieName)?.value ?? '',
    cookiePassword: serverEnv.WORKOS_COOKIE_PASSWORD,
  })
  const refreshedSession = await session.refresh()

  if (!refreshedSession.authenticated || !refreshedSession.sealedSession) {
    await clearSessionState()

    return null
  }

  await setSessionCookieValue(refreshedSession.sealedSession)

  const appUser = await findOrCreateAppUser(refreshedSession.user)

  return {
    ...refreshedSession,
    appUser,
  }
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
      parsed.mode === 'email-verification'
    ) {
      return parsed as PendingAuthState
    }
  } catch {}

  return null
}

export async function getSessionAuthentication() {
  const cookieStore = await cookies()
  const session = workos.userManagement.loadSealedSession({
    sessionData: cookieStore.get(sessionCookieName)?.value ?? '',
    cookiePassword: serverEnv.WORKOS_COOKIE_PASSWORD,
  })

  return session.authenticate()
}

export function shouldRefreshSession(
  reason: AuthenticateWithSessionCookieFailureReason
) {
  return reason === 'invalid_jwt' || reason === 'invalid_session_cookie'
}

export async function finalizeAuthentication(
  authentication: AuthenticationResponse,
  options?: {
    name?: string
  }
) {
  if (!authentication.sealedSession) {
    throw new Error('Missing sealed WorkOS session in authentication response.')
  }

  await findOrCreateAppUser(authentication.user, options?.name)
  await clearPendingAuthCookieValue()
  await setSessionCookieValue(authentication.sealedSession)
}

export async function createAuthenticationSuccessResponse(
  authentication: AuthenticationResponse,
  options?: {
    name?: string
    returnTo?: string
  }
) {
  if (!authentication.sealedSession) {
    throw new Error('Missing sealed WorkOS session in authentication response.')
  }

  await findOrCreateAppUser(authentication.user, options?.name)

  const response = NextResponse.redirect(
    getAbsoluteUrl(getSafeReturnTo(options?.returnTo ?? '/'))
  )

  clearResponsePendingAuthCookie(response)
  setResponseSessionCookie(response, authentication.sealedSession)

  return response
}

export async function getAuthenticationErrorRedirectPath(
  error: unknown,
  mode: AuthMode,
  options?: {
    name?: string
    pathname?: string
  }
) {
  const { code, message, rawData } = getErrorDetails(error)
  const pathname = options?.pathname ?? '/'
  const friendlyMessage = getFriendlyAuthErrorMessage(code, message)

  if (code === 'email_verification_required') {
    const pendingAuthenticationToken =
      typeof rawData.pending_authentication_token === 'string'
        ? rawData.pending_authentication_token
        : null
    const email = typeof rawData.email === 'string' ? rawData.email : null

    if (pendingAuthenticationToken && email) {
      await setPendingAuthCookieValue({
        mode: 'email-verification',
        email,
        name: options?.name,
        pendingAuthenticationToken,
      })

      return getPathnameWithSearch(
        pathname,
        new URLSearchParams({
          mode: 'verify-email',
          notice: 'Enter the verification code that WorkOS emailed you.',
          pendingEmail: email,
        })
      )
    }
  }

  await clearPendingAuthCookieValue()

  return getPathnameWithSearch(
    pathname,
    new URLSearchParams({
      error: friendlyMessage,
      mode,
    })
  )
}

export async function getAuthenticationErrorState(
  error: unknown,
  options?: {
    name?: string
  }
) {
  const { code, message, rawData } = getErrorDetails(error)
  const friendlyMessage = getFriendlyAuthErrorMessage(code, message)

  if (code === 'email_verification_required') {
    const pendingAuthenticationToken =
      typeof rawData.pending_authentication_token === 'string'
        ? rawData.pending_authentication_token
        : null
    const email = typeof rawData.email === 'string' ? rawData.email : null

    if (pendingAuthenticationToken && email) {
      await setPendingAuthCookieValue({
        mode: 'email-verification',
        email,
        name: options?.name,
        pendingAuthenticationToken,
      })

      return {
        notice: 'Enter the verification code that WorkOS emailed you.',
        pendingEmail: email,
      } satisfies AuthActionState
    }
  }

  await clearPendingAuthCookieValue()

  return {
    error: friendlyMessage,
  } satisfies AuthActionState
}

export async function createAuthenticationErrorResponse(
  error: unknown,
  mode: AuthMode,
  options?: {
    name?: string
    pathname?: string
  }
) {
  return NextResponse.redirect(
    getAbsoluteUrl(
      await getAuthenticationErrorRedirectPath(error, mode, options)
    )
  )
}

export function getMissingPendingAuthRedirectPath(pathname = '/') {
  return getPathnameWithSearch(
    pathname,
    new URLSearchParams({
      error: 'That authentication step has expired. Please try again.',
      mode: 'verify-email',
    })
  )
}

export async function createMissingPendingAuthResponse(pathname = '/') {
  await clearPendingAuthCookieValue()

  return NextResponse.redirect(
    getAbsoluteUrl(getMissingPendingAuthRedirectPath(pathname))
  )
}

export function getPasswordAuthenticationOptions(request: Request) {
  const requestMetadata = getRequestMetadata(request)

  return {
    clientId: serverEnv.WORKOS_CLIENT_ID,
    ipAddress: requestMetadata.ipAddress,
    session: {
      cookiePassword: serverEnv.WORKOS_COOKIE_PASSWORD,
      sealSession: true,
    },
    userAgent: requestMetadata.userAgent,
  }
}

export function getPasswordAuthenticationOptionsFromMetadata(requestMetadata: {
  ipAddress?: string
  userAgent?: string
}) {
  return {
    clientId: serverEnv.WORKOS_CLIENT_ID,
    ipAddress: requestMetadata.ipAddress,
    session: {
      cookiePassword: serverEnv.WORKOS_COOKIE_PASSWORD,
      sealSession: true,
    },
    userAgent: requestMetadata.userAgent,
  }
}

export function getCodeAuthenticationOptions(request: Request, code: string) {
  const requestMetadata = getRequestMetadata(request)

  return {
    clientId: serverEnv.WORKOS_CLIENT_ID,
    code,
    ipAddress: requestMetadata.ipAddress,
    session: {
      cookiePassword: serverEnv.WORKOS_COOKIE_PASSWORD,
      sealSession: true,
    },
    userAgent: requestMetadata.userAgent,
  }
}

export function getEmailVerificationAuthenticationOptions(
  request: Request,
  code: string,
  pendingAuthenticationToken: string
) {
  const requestMetadata = getRequestMetadata(request)

  return {
    clientId: serverEnv.WORKOS_CLIENT_ID,
    code,
    ipAddress: requestMetadata.ipAddress,
    pendingAuthenticationToken,
    session: {
      cookiePassword: serverEnv.WORKOS_COOKIE_PASSWORD,
      sealSession: true,
    },
    userAgent: requestMetadata.userAgent,
  }
}

export function getEmailVerificationAuthenticationOptionsFromMetadata(
  requestMetadata: {
    ipAddress?: string
    userAgent?: string
  },
  code: string,
  pendingAuthenticationToken: string
) {
  return {
    clientId: serverEnv.WORKOS_CLIENT_ID,
    code,
    ipAddress: requestMetadata.ipAddress,
    pendingAuthenticationToken,
    session: {
      cookiePassword: serverEnv.WORKOS_COOKIE_PASSWORD,
      sealSession: true,
    },
    userAgent: requestMetadata.userAgent,
  }
}

export function getProviderAuthorizationUrl(
  provider: 'GitHubOAuth' | 'GoogleOAuth'
) {
  return workos.userManagement.getAuthorizationUrl({
    clientId: serverEnv.WORKOS_CLIENT_ID,
    provider,
    redirectUri: getCallbackUrl(),
  })
}

export async function clearSessionState() {
  await clearPendingAuthCookieValue()
  await clearSessionCookieValue()
}

export { workos }
