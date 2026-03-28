import type { User } from '@workos-inc/node'

export function getDefaultName(user: User) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ')
    .trim()

  if (fullName) {
    return fullName
  }

  const emailName = user.email.split('@')[0]

  if (emailName) {
    return formatFallbackName(emailName)
  }

  return 'Member'
}

export function getErrorDetails(error: unknown) {
  if (!error || typeof error !== 'object') {
    return {
      code: null,
      message: 'Something went wrong while talking to WorkOS.',
      rawData: {} as Record<string, unknown>,
    }
  }

  const rawData =
    'rawData' in error && error.rawData && typeof error.rawData === 'object'
      ? (error.rawData as Record<string, unknown>)
      : {}

  const code =
    ('error' in error && typeof error.error === 'string' && error.error) ||
    ('code' in error && typeof error.code === 'string' && error.code) ||
    (typeof rawData.error === 'string' && rawData.error) ||
    (typeof rawData.code === 'string' && rawData.code) ||
    null

  const message =
    ('errorDescription' in error &&
      typeof error.errorDescription === 'string' &&
      error.errorDescription) ||
    ('message' in error &&
      typeof error.message === 'string' &&
      error.message) ||
    (typeof rawData.error_description === 'string' &&
      rawData.error_description) ||
    (typeof rawData.message === 'string' && rawData.message) ||
    'Something went wrong while talking to WorkOS.'

  return { code, message, rawData }
}

export function getFriendlyAuthErrorMessage(
  code: string | null,
  message: string
) {
  if (message === 'Password does not meet strength requirements.') {
    return 'WorkOS rejected that password because the environment password policy is enabled in the WorkOS dashboard.'
  }

  return message
}

export function getPathnameWithSearch(
  pathname: string,
  searchParams?: URLSearchParams
) {
  if (!searchParams || !searchParams.toString()) {
    return pathname
  }

  return `${pathname}?${searchParams.toString()}`
}

export function getRequestMetadataFromHeaders(headerList: Headers) {
  const forwardedFor = headerList.get('x-forwarded-for')

  return {
    ipAddress: forwardedFor
      ? forwardedFor.split(',')[0]?.trim()
      : (headerList.get('x-real-ip') ?? undefined),
    userAgent: headerList.get('user-agent') ?? undefined,
  }
}

function formatFallbackName(value: string) {
  const normalizedValue = value.trim().replace(/[._-]+/g, ' ')

  if (!normalizedValue) {
    return 'Member'
  }

  return normalizedValue
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ')
}
