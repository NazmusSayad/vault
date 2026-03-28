'use client'

import { z } from 'zod'

const clientEnvSchema = z.object({
  APP_URL: z.url(),
})

export const clientEnv = clientEnvSchema.parse({
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
