'use server'

import { normalizeEmail } from '@/server/auth/auth-helpers'
import { createSessionUser } from '@/server/auth/session'
import { prisma } from '@/server/db'
import { resetPasswordOTPGenerator } from '@/server/lib/auth-otp'
import { hashPassword } from '@/server/lib/hash'
import { sendOtpEmail } from '@/server/lib/mailer'
import { z } from 'zod'

const requestResetPasswordOTPSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

const confirmResetPasswordOTPSchema = z.object({
  email: z.email('Enter a valid email address.'),
  otp: z.string().length(6, 'Enter the six-digit code.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  tokens: z.array(z.string().min(1)).min(1),
})

export async function requestResetPasswordOTPAction(
  input: z.infer<typeof requestResetPasswordOTPSchema>
) {
  const body = requestResetPasswordOTPSchema.parse(input)
  const email = normalizeEmail(body.email)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
    },
  })

  if (!user) {
    throw new Error('No account found for this email address.')
  }

  const otp = await resetPasswordOTPGenerator.createToken({
    email,
    userId: user.id,
  })

  await sendOtpEmail({
    description: 'Use this code to reset your KeyVoid password.',
    email,
    otp: otp.otp,
    subject: 'Reset your KeyVoid password',
  }).catch((error) => {
    console.error('Failed to send OTP email:', error)
    console.log(otp)
  })

  return {
    email,
    token: otp.token,
  }
}

export async function confirmResetPasswordOTPAction(
  input: z.infer<typeof confirmResetPasswordOTPSchema>
) {
  const body = confirmResetPasswordOTPSchema.parse(input)
  const email = normalizeEmail(body.email)
  const payload = await resetPasswordOTPGenerator.verifyToken(
    body.tokens,
    body.otp
  )

  if (payload.email !== email) {
    throw new Error('The verification code does not match this email.')
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  })

  if (!user || normalizeEmail(user.email) !== email) {
    throw new Error('User not found.')
  }

  const prevPasswordChangedAt = user.passwordChangedAt
  if (
    prevPasswordChangedAt &&
    prevPasswordChangedAt.getTime() >= payload.iat * 1000
  ) {
    throw new Error('This code has already been used. Request a new one.')
  }

  const newPasswordChangedAt = new Date()
  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(body.password),
      passwordChangedAt: newPasswordChangedAt,
    },
  })

  return {
    user: await createSessionUser(updatedUser),
  }
}
