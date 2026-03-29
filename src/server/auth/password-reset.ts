'use server'

import { prisma } from '@/server/.db'
import { workos } from '@/server/auth/shared'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

const resetPasswordSchema = z.object({
  newPassword: z.string().min(1, 'Enter your new password.'),
  token: z.string().trim().min(1, 'This reset link is missing its token.'),
})

export async function forgotPasswordAction(
  input: z.infer<typeof forgotPasswordSchema>
) {
  const body = forgotPasswordSchema.parse(input)

  try {
    await workos.userManagement.createPasswordReset({
      email: body.email,
    })
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : 'Could not start the password reset flow.'
    )
  }

  return {
    notice: 'If an account matches that email, WorkOS will send a reset link.',
    success: true,
  }
}

export async function resetPasswordAction(
  input: z.infer<typeof resetPasswordSchema>
) {
  const body = resetPasswordSchema.parse(input)

  try {
    const { user } = await workos.userManagement.resetPassword({
      newPassword: body.newPassword,
      token: body.token,
    })

    await prisma.user.update({
      where: {
        workosId: user.id,
      },
      data: {
        authChangedAt: new Date(),
        isVerified: user.emailVerified,
      },
    })
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : 'Could not reset your password.'
    )
  }

  return {
    redirectTo:
      '/auth/login?notice=Your%20password%20has%20been%20reset.%20Sign%20in%20with%20your%20new%20password.',
    success: true,
  }
}
