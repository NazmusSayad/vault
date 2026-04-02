'use server'

import { serverEnv } from '@/env.server'
import { SessionUser } from '@/lib/schema'
import {
  clearSessionCookie,
  getSessionCookieValue,
  setSessionCookie,
} from '@/server/auth/auth-state'
import { prisma } from '@/server/db'
import { SignJWT, jwtVerify } from 'jose'
import { User } from '../db/.prisma/client'

const jwtAudience = 'vault-app-session'
const jwtIssuer = serverEnv.APP_URL
const jwtSecret = new TextEncoder().encode(serverEnv.JWT_SESSION_SECRET)

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

export async function createSessionUser(appUser: User) {
  const sessionToken = await createSessionToken(appUser.id)
  await setSessionCookie(sessionToken)

  return SessionUser.parse(appUser)
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

  return SessionUser.parse(appUser)
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
