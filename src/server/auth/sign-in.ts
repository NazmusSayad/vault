'use server'

import { createSessionUser } from '@/server/auth/session'
import {
  getCurrentRequestMetadata,
  getPasswordAuthenticationOptions,
  workos,
} from '@/server/auth/shared'
import { getAuthFeedbackFromError } from '@/server/auth/verification'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
})

export async function signInAction(input: z.infer<typeof signInSchema>) {
  const body = signInSchema.parse(input)

  try {
    const authentication = await workos.userManagement.authenticateWithPassword(
      getPasswordAuthenticationOptions(
        await getCurrentRequestMetadata(),
        body.email,
        body.password
      )
    )

    return {
      user: await createSessionUser(authentication.user),
    }
  } catch (error) {
    const feedback = await getAuthFeedbackFromError(error)

    if (feedback.error) {
      throw new Error(feedback.error)
    }

    return feedback
  }
}
