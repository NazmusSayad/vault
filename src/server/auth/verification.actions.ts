'use server'

import { verifyEmail } from '@/server/auth/verification'

export async function verifyEmailAction(
  input: Parameters<typeof verifyEmail>[0]
) {
  return verifyEmail(input)
}
