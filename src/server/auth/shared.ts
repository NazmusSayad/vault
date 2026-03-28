import 'server-only'

import { serverEnv } from '@/env.server'
import { getRequestMetadataFromHeaders } from '@/server/auth/auth-helpers'
import { WorkOS } from '@workos-inc/node'
import { headers } from 'next/headers'

export const workos = new WorkOS(serverEnv.WORKOS_API_KEY, {
  clientId: serverEnv.WORKOS_CLIENT_ID,
})

export function getAbsoluteUrl(pathname = '/') {
  return new URL(pathname, serverEnv.APP_URL)
}

export async function getCurrentRequestMetadata() {
  return getRequestMetadataFromHeaders(await headers())
}

export function getPasswordAuthenticationOptions(
  requestMetadata: {
    ipAddress?: string
    userAgent?: string
  },
  email: string,
  password: string
) {
  return {
    clientId: serverEnv.WORKOS_CLIENT_ID,
    email,
    ipAddress: requestMetadata.ipAddress,
    password,
    userAgent: requestMetadata.userAgent,
  }
}

export function getCodeAuthenticationOptions(request: Request, code: string) {
  const requestMetadata = getRequestMetadataFromHeaders(request.headers)

  return {
    clientId: serverEnv.WORKOS_CLIENT_ID,
    code,
    ipAddress: requestMetadata.ipAddress,
    userAgent: requestMetadata.userAgent,
  }
}
