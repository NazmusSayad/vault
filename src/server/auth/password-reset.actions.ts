'use server'

import { forgotPassword, resetPassword } from '@/server/auth/password-reset'

export async function forgotPasswordAction(
  input: Parameters<typeof forgotPassword>[0]
) {
  return forgotPassword(input)
}

export async function resetPasswordAction(
  input: Parameters<typeof resetPassword>[0]
) {
  return resetPassword(input)
}
