import 'server-only'

import {
  getErrorDetails,
  getFriendlyAuthErrorMessage,
  getPathnameWithSearch,
} from '@/server/auth/auth-helpers'
import {
  clearPendingAuthState,
  getPendingAuthState,
  setPendingAuthState,
} from '@/server/auth/auth-state'
import { createSessionUser } from '@/server/auth/session'
import {
  getAbsoluteUrl,
  getCurrentRequestMetadata,
  getEmailVerificationAuthenticationOptionsFromMetadata,
  workos,
} from '@/server/auth/shared'
import type { AuthFeedback } from '@/server/auth/types'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  code: z.string().trim().length(6, 'Enter the 6-digit verification code.'),
})

export async function getAuthFeedbackFromError(
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
      await setPendingAuthState({
        mode: 'email-verification',
        email,
        name: options?.name,
        pendingAuthenticationToken,
      })

      return {
        notice: 'Enter the verification code that WorkOS emailed you.',
        pendingEmail: email,
      } satisfies AuthFeedback
    }
  }

  await clearPendingAuthState()

  return {
    error: friendlyMessage,
  } satisfies AuthFeedback
}

async function getAuthenticationErrorRedirectPath(
  error: unknown,
  mode:
    | 'forgot-password'
    | 'reset-password'
    | 'sign-in'
    | 'sign-up'
    | 'verify-email',
  options?: {
    name?: string
    pathname?: string
  }
) {
  const feedback = await getAuthFeedbackFromError(error, {
    name: options?.name,
  })
  const pathname = options?.pathname ?? '/'

  if (feedback.pendingEmail) {
    return getPathnameWithSearch(
      pathname,
      new URLSearchParams({
        mode: 'verify-email',
        notice:
          feedback.notice ??
          'Enter the verification code that WorkOS emailed you.',
        pendingEmail: feedback.pendingEmail,
      })
    )
  }

  return getPathnameWithSearch(
    pathname,
    new URLSearchParams({
      error: feedback.error ?? 'Something went wrong while talking to WorkOS.',
      mode,
    })
  )
}

export async function createAuthenticationErrorResponse(
  error: unknown,
  mode:
    | 'forgot-password'
    | 'reset-password'
    | 'sign-in'
    | 'sign-up'
    | 'verify-email',
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

export async function verifyEmail(input: z.infer<typeof verifyEmailSchema>) {
  const body = verifyEmailSchema.parse(input)
  const pendingAuthState = await getPendingAuthState()

  if (!pendingAuthState || pendingAuthState.mode !== 'email-verification') {
    throw new Error('That authentication step has expired. Please try again.')
  }

  try {
    const authentication =
      await workos.userManagement.authenticateWithEmailVerification(
        getEmailVerificationAuthenticationOptionsFromMetadata(
          await getCurrentRequestMetadata(),
          body.code,
          pendingAuthState.pendingAuthenticationToken
        )
      )

    return {
      user: await createSessionUser(authentication.user, {
        name: pendingAuthState.name,
      }),
    }
  } catch (error) {
    const feedback = await getAuthFeedbackFromError(error, {
      name: pendingAuthState.name,
    })

    if (feedback.error) {
      throw new Error(feedback.error)
    }

    return feedback
  }
}
