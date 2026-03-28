'use server'

import { signIn } from '@/server/auth/sign-in'

export async function signInAction(input: Parameters<typeof signIn>[0]) {
  return signIn(input)
}
