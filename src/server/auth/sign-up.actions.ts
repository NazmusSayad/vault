'use server'

import { signUp } from '@/server/auth/sign-up'

export async function signUpAction(input: Parameters<typeof signUp>[0]) {
  return signUp(input)
}
