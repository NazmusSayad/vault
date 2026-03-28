'use server'

import { serverEnv } from '@/env.server'
import { getAbsoluteUrl, workos } from '@/server/auth/shared'
import { z } from 'zod'

const socialProviderSchema = z.enum(['GitHubOAuth', 'GoogleOAuth'])

export async function getSocialAuthUrlAction(
  provider: z.infer<typeof socialProviderSchema>
) {
  return {
    url: workos.userManagement.getAuthorizationUrl({
      clientId: serverEnv.WORKOS_CLIENT_ID,
      provider: socialProviderSchema.parse(provider),
      redirectUri: getAbsoluteUrl('/auth/callback').toString(),
    }),
  }
}
