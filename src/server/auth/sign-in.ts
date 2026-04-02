'use server'

import { normalizeEmail } from '@/server/auth/auth-helpers'
import { createSessionUser } from '@/server/auth/session'
import { prisma } from '@/server/db'
import { verifyPassword } from '@/server/lib/hash'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export async function signInAction(input: z.infer<typeof signInSchema>) {
  const body = signInSchema.parse(input)
  const email = normalizeEmail(body.email)
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    throw new Error('No account found for this email address.')
  }

  if (!user.password) {
    throw new Error(
      'This account currently uses social sign-in. Use social sign-in or reset your password.'
    )
  }

  const isPasswordValid = await verifyPassword({
    hash: user.password,
    password: body.password,
  })

  if (!isPasswordValid) {
    throw new Error('Incorrect password.')
  }

  return {
    user: await createSessionUser(user),
  }
}
