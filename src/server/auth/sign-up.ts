'use server'

import {
  getDefaultNameFromEmail,
  normalizeEmail,
} from '@/server/auth/auth-helpers'
import { createSessionUser } from '@/server/auth/session'
import { prisma } from '@/server/db'
import { registerOTPGenerator } from '@/server/lib/auth-otp'
import { hashPassword } from '@/server/lib/hash'
import { sendOtpEmail } from '@/server/lib/mailer'
import { z } from 'zod'

const requestSignUpOTPSchema = z.object({
  email: z.email('Enter a valid email address.'),
  name: z.string().trim().min(1, 'Enter your name.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
})

const confirmSignUpOTPSchema = z.object({
  email: z.email('Enter a valid email address.'),
  name: z.string().trim().min(1, 'Enter your name.'),
  otp: z.string().length(6, 'Enter the six-digit code.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  tokens: z.array(z.string().min(1)).min(1),
})

export async function requestSignUpOTPAction(
  input: z.infer<typeof requestSignUpOTPSchema>
) {
  const body = requestSignUpOTPSchema.parse(input)
  const email = normalizeEmail(body.email)
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  })

  if (existingUser) {
    throw new Error('An account already exists for this email address.')
  }

  const otp = await registerOTPGenerator.createToken({ email })

  await sendOtpEmail({
    description: 'Use this code to verify your KeyVoid registration.',
    email,
    otp: otp.otp,
    subject: 'Verify your KeyVoid registration',
  })

  return {
    email,
    token: otp.token,
  }
}

export async function confirmSignUpOTPAction(
  input: z.infer<typeof confirmSignUpOTPSchema>
) {
  const body = confirmSignUpOTPSchema.parse(input)
  const email = normalizeEmail(body.email)
  const payload = await registerOTPGenerator.verifyToken(body.tokens, body.otp)

  if (payload.email !== email) {
    throw new Error('The verification code does not match this email.')
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true },
  })

  if (existingUser?.password) {
    throw new Error('This email is already registered.')
  }

  if (existingUser && !existingUser.password) {
    const now = new Date()
    const user = await prisma.user.update({
      where: { id: existingUser.id },
      data: {
        name: body.name,
        password: await hashPassword(body.password),
        passwordChangedAt: now,
      },
    })

    return {
      user: await createSessionUser(user),
    }
  }

  const now = new Date()
  const user = await prisma.user.create({
    data: {
      email,
      name: body.name.trim() || getDefaultNameFromEmail(email),
      password: await hashPassword(body.password),
      passwordChangedAt: now,
    },
  })

  return {
    user: await createSessionUser(user),
  }
}
