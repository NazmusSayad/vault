'use server'

import { serverEnv } from '@/env.server'
import {
  clearSessionCookie,
  getSessionCookieValue,
  setResponseSessionCookie,
  setSessionCookie,
} from '@/server/auth/auth-state'
import type { SessionUser } from '@/server/auth/types'
import { prisma } from '@/server/db'
import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

const jwtAudience = 'vault-app-session'
const jwtIssuer = serverEnv.APP_URL
const jwtSecret = new TextEncoder().encode(serverEnv.JWT_SESSION_SECRET)

function serializeSessionUser(appUser: {
  id: string
  name: string
  avatarUrl: string | null
}) {
  return {
    avatarUrl: appUser.avatarUrl,
    id: appUser.id,
    name: appUser.name,
  } satisfies SessionUser
}

async function createSessionToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience(jwtAudience)
    .setExpirationTime('30d')
    .setIssuedAt()
    .setIssuer(jwtIssuer)
    .setSubject(userId)
    .sign(jwtSecret)
}

async function verifySessionToken() {
  const token = await getSessionCookieValue()

  if (!token) {
    return null
  }

  try {
    const { payload } = await jwtVerify(token, jwtSecret, {
      audience: jwtAudience,
      issuer: jwtIssuer,
    })

    if (typeof payload.sub !== 'string') {
      return null
    }

    return payload
  } catch {
    return null
  }
}

function isPasswordChangeNewerThanToken(
  appUser: {
    passwordChangedAt: Date | null
  },
  issuedAt?: number
) {
  if (!appUser.passwordChangedAt || typeof issuedAt !== 'number') {
    return false
  }

  return issuedAt < Math.floor(appUser.passwordChangedAt.getTime() / 1000)
}

export async function createSessionUser(appUser: {
  id: string
  name: string
  avatarUrl: string | null
}) {
  await setSessionCookie(await createSessionToken(appUser.id))

  return serializeSessionUser(appUser)
}

export async function createAuthenticationSuccessResponse(
  appUser: { id: string },
  options?: { returnTo?: string }
) {
  const response = NextResponse.redirect(
    new URL(
      options?.returnTo?.startsWith('/') ? options.returnTo : '/',
      serverEnv.APP_URL
    )
  )

  setResponseSessionCookie(response, await createSessionToken(appUser.id))

  return response
}

async function getCurrentSessionUser() {
  const payload = await verifySessionToken()

  if (!payload?.sub) {
    if (await getSessionCookieValue()) {
      await clearSessionCookie()
    }

    return null
  }

  const appUser = await prisma.user.findUnique({
    where: { id: payload.sub },
  })

  if (!appUser || isPasswordChangeNewerThanToken(appUser, payload.iat)) {
    await clearSessionCookie()

    return null
  }

  return serializeSessionUser(appUser)
}

export async function requireCurrentSessionUser() {
  const user = await getCurrentSessionUser()

  if (!user) {
    throw new Error('You must sign in to continue.')
  }

  return user
}

export async function getSessionAction() {
  return {
    user: await getCurrentSessionUser(),
  }
}

export async function signOutAction() {
  await clearSessionCookie()

  return { success: true }
}
