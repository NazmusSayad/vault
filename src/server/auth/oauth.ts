'use server'

import { serverEnv } from '@/env.server'
import { z } from 'zod'

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
