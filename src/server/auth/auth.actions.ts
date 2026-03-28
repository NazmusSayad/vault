'use server'
import 'server-only'

import {
  clearSessionState,
  finalizeAuthentication,
  getAuthenticationErrorState,
  getCurrentRequestMetadata,
  getCurrentSessionUser,
  getEmailVerificationAuthenticationOptionsFromMetadata,
  getPasswordAuthenticationOptionsFromMetadata,
  getPendingAuthState,
  getProviderAuthorizationUrl,
  workos,
} from '@/server/auth/auth'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

const signUpSchema = z.object({
  email: z.email('Enter a valid email address.'),
  name: z.string().trim().min(1, 'Enter your name.'),
  password: z.string().min(1, 'Enter your password.'),
})

const verifyEmailSchema = z.object({
  code: z.string().trim().length(6, 'Enter the 6-digit verification code.'),
})

const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

const resetPasswordSchema = z.object({
  newPassword: z.string().min(1, 'Enter your new password.'),
  token: z.string().trim().min(1, 'This reset link is missing its token.'),
})

const socialProviderSchema = z.enum(['GitHubOAuth', 'GoogleOAuth'])

export type SessionUser = {
  appUserId: string
  authenticationMethod: string | null
  email: string
  emailVerified: boolean
  lastSignInAt: string | null
  name: string
  workosUserId: string
}

export type SocialAuthUrlResult = {
  url: string
}

function serializeSessionUser(
  currentUser: Awaited<ReturnType<typeof getCurrentSessionUser>>
): SessionUser | null {
  if (!currentUser) {
    return null
  }

  return {
    appUserId: currentUser.appUser.id,
    authenticationMethod: currentUser.authenticationMethod ?? null,
    email: currentUser.user.email,
    emailVerified: currentUser.user.emailVerified,
    lastSignInAt: currentUser.user.lastSignInAt,
    name: currentUser.appUser.name,
    workosUserId: currentUser.appUser.workosUserId,
  }
}

export async function getSessionAction() {
  const currentUser = await getCurrentSessionUser()

  return {
    user: currentUser ? serializeSessionUser(currentUser) : null,
  }
}

export async function getSocialAuthUrlAction(
  provider: z.infer<typeof socialProviderSchema>
): Promise<SocialAuthUrlResult> {
  return {
    url: getProviderAuthorizationUrl(socialProviderSchema.parse(provider)),
  }
}

export async function signOutAction() {
  await clearSessionState()

  return { success: true }
}

export async function signInAction(input: z.infer<typeof signInSchema>) {
  const body = signInSchema.parse(input)

  try {
    const authentication = await workos.userManagement.authenticateWithPassword(
      {
        ...getPasswordAuthenticationOptionsFromMetadata(
          await getCurrentRequestMetadata()
        ),
        email: body.email,
        password: body.password,
      }
    )

    await finalizeAuthentication(authentication)
  } catch (error) {
    const authError = await getAuthenticationErrorState(error)

    if (authError.error) {
      throw new Error(authError.error)
    }

    return authError
  }

  return getSessionAction()
}

export async function signUpAction(input: z.infer<typeof signUpSchema>) {
  const body = signUpSchema.parse(input)

  try {
    await workos.userManagement.createUser({
      email: body.email,
      emailVerified: true,
      password: body.password,
    })

    const authentication = await workos.userManagement.authenticateWithPassword(
      {
        ...getPasswordAuthenticationOptionsFromMetadata(
          await getCurrentRequestMetadata()
        ),
        email: body.email,
        password: body.password,
      }
    )

    await finalizeAuthentication(authentication, {
      name: body.name,
    })
  } catch (error) {
    const authError = await getAuthenticationErrorState(error, {
      name: body.name,
    })

    if (authError.error) {
      throw new Error(authError.error)
    }

    return authError
  }

  return getSessionAction()
}

export async function verifyEmailAction(
  input: z.infer<typeof verifyEmailSchema>
) {
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

    await finalizeAuthentication(authentication, {
      name: pendingAuthState.name,
    })
  } catch (error) {
    const authError = await getAuthenticationErrorState(error, {
      name: pendingAuthState.name,
    })

    if (authError.error) {
      throw new Error(authError.error)
    }

    return authError
  }

  return getSessionAction()
}

export async function forgotPasswordAction(
  input: z.infer<typeof forgotPasswordSchema>
) {
  const body = forgotPasswordSchema.parse(input)

  try {
    await workos.userManagement.createPasswordReset({
      email: body.email,
    })
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Could not start the password reset flow.'
    )
  }

  return {
    notice: 'If an account matches that email, WorkOS will send a reset link.',
    success: true,
  }
}

export async function resetPasswordAction(
  input: z.infer<typeof resetPasswordSchema>
) {
  const body = resetPasswordSchema.parse(input)

  try {
    await workos.userManagement.resetPassword({
      newPassword: body.newPassword,
      token: body.token,
    })
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Could not reset your password.'
    )
  }

  return {
    redirectTo:
      '/login?notice=Your%20password%20has%20been%20reset.%20Sign%20in%20with%20your%20new%20password.',
    success: true,
  }
}
