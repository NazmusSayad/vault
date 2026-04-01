'use server'

import { serverEnv } from '@/env.server'
import { getDefaultName } from '@/server/auth/auth-helpers'
import {
  clearPendingAuthState,
  clearResponsePendingAuthCookie,
  clearSessionCookie,
  getSessionCookieValue,
  setResponseSessionCookie,
  setSessionCookie,
} from '@/server/auth/auth-state'
import { getAbsoluteUrl } from '@/server/auth/shared'
import type { SessionUser } from '@/server/auth/types'
import { prisma } from '@/server/db'
import type { User } from '@workos-inc/node'
import { SignJWT, jwtVerify } from 'jose'
import { NextResponse } from 'next/server'

const jwtAudience = 'vault-app-session'
const jwtIssuer = serverEnv.APP_URL
const jwtSecret = new TextEncoder().encode(serverEnv.APP_SESSION_SECRET)

function serializeSessionUser(appUser: {
  id: string
  name: string
  isVerified: boolean
}) {
  return {
    id: appUser.id,
    name: appUser.name,
    isVerified: appUser.isVerified,
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
    authChangedAt: Date | null
  },
  issuedAt?: number
) {
  if (!appUser.authChangedAt || typeof issuedAt !== 'number') {
    return false
  }

  return issuedAt < Math.floor(appUser.authChangedAt.getTime() / 1000)
}

async function syncAppUser(workosUser: User, options?: { name?: string }) {
  const existingUser = await prisma.user.findUnique({
    where: { workosId: workosUser.id },
  })

  const profilePictureUrl = workosUser.profilePictureUrl?.trim()

  if (!existingUser) {
    return prisma.user.create({
      data: {
        avatarUrl: profilePictureUrl,
        name: options?.name?.trim() || getDefaultName(workosUser),
        isVerified: workosUser.emailVerified,
        workosId: workosUser.id,
      },
    })
  }

  if (
    existingUser.isVerified === workosUser.emailVerified &&
    (existingUser.avatarUrl || !profilePictureUrl)
  ) {
    return existingUser
  }

  return prisma.user.update({
    where: { id: existingUser.id },
    data: {
      avatarUrl: existingUser.avatarUrl || profilePictureUrl,
      isVerified: workosUser.emailVerified,
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
    getAbsoluteUrl(options?.returnTo?.startsWith('/') ? options.returnTo : '/')
  )

  clearResponsePendingAuthCookie(response)
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
  await clearPendingAuthState()
  await clearSessionCookie()

  return { success: true }
}
