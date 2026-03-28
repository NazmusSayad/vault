import 'server-only'

import { serverEnv } from '@/env.server'
import { getRequestMetadataFromHeaders } from '@/server/auth/auth-helpers'
import { WorkOS } from '@workos-inc/node'
import { headers } from 'next/headers'

export const workos = new WorkOS(serverEnv.WORKOS_API_KEY, {
  clientId: serverEnv.WORKOS_CLIENT_ID,
})

function getCallbackUrl() {
  return getAbsoluteUrl('/auth/callback').toString()
}

export function getAbsoluteUrl(pathname = '/') {
  return new URL(pathname, serverEnv.APP_URL)
}

export function getSafeReturnTo(value?: string | null) {
  if (!value?.startsWith('/')) {
    return '/'
  }

  return value
}

export function getRequestMetadata(request: Request) {
  return getRequestMetadataFromHeaders(request.headers)
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
  const requestMetadata = getRequestMetadata(request)

  return {
    clientId: serverEnv.WORKOS_CLIENT_ID,
    code,
    ipAddress: requestMetadata.ipAddress,
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
    userAgent: requestMetadata.userAgent,
  }
}

export function getSocialAuthUrl(provider: 'GitHubOAuth' | 'GoogleOAuth') {
  return workos.userManagement.getAuthorizationUrl({
    clientId: serverEnv.WORKOS_CLIENT_ID,
    provider,
    redirectUri: getCallbackUrl(),
  })
}
