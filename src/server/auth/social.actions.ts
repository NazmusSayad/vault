'use server'

import { getSocialAuthUrlForProvider } from '@/server/auth/social'

export async function getSocialAuthUrlAction(
  provider: Parameters<typeof getSocialAuthUrlForProvider>[0]
) {
  return getSocialAuthUrlForProvider(provider)
}
