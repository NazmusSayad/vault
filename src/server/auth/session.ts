import 'server-only'

import { serverEnv } from '@/env.server'
import { prisma } from '@/server/.db'
import { getDefaultName } from '@/server/auth/auth-helpers'
import {
  clearPendingAuthState,
  clearResponsePendingAuthCookie,
  clearSessionCookie,
  getSessionCookieValue,
  setResponseSessionCookie,
  setSessionCookie,
} from '@/server/auth/auth-state'
import { getAbsoluteUrl, getSafeReturnTo } from '@/server/auth/shared'
import type { SessionUser } from '@/server/auth/types'
import type { User } from '@workos-inc/node'
import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

const jwtAudience = 'vault-app-session'
const jwtIssuer = serverEnv.APP_URL
const jwtSecret = new TextEncoder().encode(serverEnv.APP_SESSION_SECRET)

function serializeSessionUser(appUser: {
  id: string
  name: string
  userVerified: boolean
}) {
  return {
    id: appUser.id,
    name: appUser.name,
    userVerified: appUser.userVerified,
  } satisfies SessionUser
}

async function createSessionToken(userId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: 'HS256' })
    .setAudience(jwtAudience)
    .setExpirationTime(serverEnv.APP_SESSION_TTL)
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

function getNameOverride(name?: string) {
  const trimmedName = name?.trim()

  return trimmedName ? trimmedName : undefined
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

async function syncAppUser(workosUser: User, options?: { name?: string }) {
  const existingUser = await prisma.user.findUnique({
    where: { workosUserId: workosUser.id },
  })

  if (!existingUser) {
    return prisma.user.create({
      data: {
        name: getNameOverride(options?.name) ?? getDefaultName(workosUser),
        userVerified: workosUser.emailVerified,
        workosUserId: workosUser.id,
      },
    })
  }

  if (existingUser.userVerified === workosUser.emailVerified) {
    return existingUser
  }

  return prisma.user.update({
    where: { id: existingUser.id },
    data: {
      userVerified: workosUser.emailVerified,
    },
  })
}

export async function createSessionUser(
  workosUser: User,
  options?: {
    name?: string
  }
) {
  const appUser = await syncAppUser(workosUser, options)

  await clearPendingAuthState()
  await setSessionCookie(await createSessionToken(appUser.id))

  return serializeSessionUser(appUser)
}

export async function createAuthenticationSuccessResponse(
  workosUser: User,
  options?: {
    name?: string
    returnTo?: string
  }
) {
  const appUser = await syncAppUser(workosUser, options)
  const response = NextResponse.redirect(
    getAbsoluteUrl(getSafeReturnTo(options?.returnTo ?? '/'))
  )

  clearResponsePendingAuthCookie(response)
  setResponseSessionCookie(response, await createSessionToken(appUser.id))

  return response
}

export async function markPasswordChanged(workosUser: User) {
  const appUser = await syncAppUser(workosUser)

  await prisma.user.update({
    where: { id: appUser.id },
    data: {
      passwordChangedAt: new Date(),
    },
  })
}

export async function getCurrentSessionUser() {
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

export async function getSession() {
  return {
    user: await getCurrentSessionUser(),
  }
}

export async function signOut() {
  await clearPendingAuthState()
  await clearSessionCookie()

  return { success: true }
}
