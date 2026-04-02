'use server'

import { getAbsoluteUrl } from '@/server/auth/shared'
import { z } from 'zod'

const socialProviderSchema = z.enum(['GitHubOAuth', 'GoogleOAuth'])

export async function getSocialAuthUrlAction(
  provider: z.infer<typeof socialProviderSchema>
) {
  const parsedProvider = socialProviderSchema.parse(provider)

  return {
    url: getAbsoluteUrl(
      parsedProvider === 'GitHubOAuth' ? '/oauth/github' : '/oauth/google'
    ).toString(),
  }
}
