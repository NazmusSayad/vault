'use server'

import { serverEnv } from '@/env.server'
import { normalizeEmail } from '@/server/auth/auth-helpers'
import { verifyPassword } from '@/server/auth/password'
import { createSessionUser } from '@/server/auth/session'
import { prisma } from '@/server/db'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

const socialProviderSchema = z.enum(['github', 'google'])

export async function getSocialAuthUrlAction(
  provider: z.infer<typeof socialProviderSchema>
) {
  const parsedProvider = socialProviderSchema.parse(provider)

  if (parsedProvider === 'google') {
    const params = new URLSearchParams({
      client_id: serverEnv.OAUTH_GOOGLE_CLIENT_ID,
      redirect_uri: `${serverEnv.APP_URL}/oauth/google`,
      response_type: 'code',
      scope: 'openid email profile',
    })

    return {
      url: `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
    }
  }

  const params = new URLSearchParams({
    client_id: serverEnv.OAUTH_GITHUB_CLIENT_ID,
    redirect_uri: `${serverEnv.APP_URL}/oauth/github`,
    scope: 'read:user user:email',
  })

  return {
    url: `https://github.com/login/oauth/authorize?${params.toString()}`,
  }
}

export async function signInAction(input: z.infer<typeof signInSchema>) {
  const body = signInSchema.parse(input)
  const email = normalizeEmail(body.email)
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('No account found for this email address.')
  }

  if (!user.password) {
    throw new Error(
      'This account currently uses social sign-in. Use social sign-in or reset your password.'
    )
  }

  const isPasswordValid = await verifyPassword({
    hash: user.password,
    password: body.password,
  })

  if (!isPasswordValid) {
    throw new Error('Incorrect password.')
  }

  return {
    user: await createSessionUser(user),
  }
}
