import {
  createAuthenticationErrorResponse,
  createAuthenticationSuccessResponse,
  getCodeAuthenticationOptions,
  getEmailVerificationAuthenticationOptions,
  workos,
} from '@/server/auth'
import { getErrorDetails } from '@/server/auth-helpers'
import { NextResponse } from 'next/server'

function getCallbackErrorMessage(
  error: string | null,
  errorDescription: string | null
) {
  return errorDescription ?? 'WorkOS returned an authentication error.'
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')

  if (error || errorDescription) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          getCallbackErrorMessage(error, errorDescription)
        )}`,
        request.url
      )
    )
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(
        '/login?error=WorkOS%20did%20not%20return%20an%20authorization%20code.',
        request.url
      )
    )
  }

  try {
    const authentication = await workos.userManagement.authenticateWithCode(
      getCodeAuthenticationOptions(request, code)
    )

    return createAuthenticationSuccessResponse(authentication)
  } catch (error) {
    const { code: errorCode, rawData } = getErrorDetails(error)

    if (errorCode === 'email_verification_required') {
      const emailVerificationId =
        typeof rawData.email_verification_id === 'string'
          ? rawData.email_verification_id
          : null
      const pendingAuthenticationToken =
        typeof rawData.pending_authentication_token === 'string'
          ? rawData.pending_authentication_token
          : null

      if (emailVerificationId && pendingAuthenticationToken) {
        const emailVerification =
          await workos.userManagement.getEmailVerification(emailVerificationId)

        const authentication =
          await workos.userManagement.authenticateWithEmailVerification(
            getEmailVerificationAuthenticationOptions(
              request,
              emailVerification.code,
              pendingAuthenticationToken
            )
          )

        return createAuthenticationSuccessResponse(authentication)
      }

      const email = typeof rawData.email === 'string' ? rawData.email : null

      if (email) {
        const users = await workos.userManagement.listUsers({ email })
        const existingUser = users.data.find((user) => !user.emailVerified)

        if (existingUser && !existingUser.emailVerified) {
          await workos.userManagement.updateUser({
            userId: existingUser.id,
            emailVerified: true,
          })

          try {
            const authentication =
              await workos.userManagement.authenticateWithCode(
                getCodeAuthenticationOptions(request, code)
              )

            return createAuthenticationSuccessResponse(authentication)
          } catch {}
        }
      }
    }

    return createAuthenticationErrorResponse(error, 'sign-in', {
      pathname: '/login',
    })
  }
}
