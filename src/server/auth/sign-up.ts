'use server'

import { createSessionUser } from '@/server/auth/session'
import {
  getCurrentRequestMetadata,
  getPasswordAuthenticationOptions,
  workos,
} from '@/server/auth/shared'
import { getAuthFeedbackFromError } from '@/server/auth/verification'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.email('Enter a valid email address.'),
  name: z.string().trim().min(1, 'Enter your name.'),
  password: z.string().min(1, 'Enter your password.'),
})

export async function signUpAction(input: z.infer<typeof signUpSchema>) {
  const body = signUpSchema.parse(input)

  try {
    await workos.userManagement.createUser({
      email: body.email,
      password: body.password,
    })

    const authentication = await workos.userManagement.authenticateWithPassword(
      getPasswordAuthenticationOptions(
        await getCurrentRequestMetadata(),
        body.email,
        body.password
      )
    )

    return {
      user: await createSessionUser(authentication.user, {
        name: body.name,
      }),
    }
  } catch (error) {
    const feedback = await getAuthFeedbackFromError(error, {
      name: body.name,
    })

    if (feedback.error) {
      throw new Error(feedback.error)
    }

    return feedback
  }
}
