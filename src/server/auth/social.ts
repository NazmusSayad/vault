import 'server-only'

import {
  getCodeAuthenticationOptions,
  getSocialAuthUrl,
  workos,
} from '@/server/auth/shared'
import { z } from 'zod'

const socialProviderSchema = z.enum(['GitHubOAuth', 'GoogleOAuth'])

export function getSocialAuthUrlForProvider(
  provider: z.infer<typeof socialProviderSchema>
) {
  return {
    url: getSocialAuthUrl(socialProviderSchema.parse(provider)),
  }
}

export async function authenticateWithCode(request: Request, code: string) {
  return workos.userManagement.authenticateWithCode(
    getCodeAuthenticationOptions(request, code)
  )
}
