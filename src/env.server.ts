import { z } from 'zod'

const serverEnvSchema = z.object({
  APP_URL: z.url(),
  APP_SESSION_SECRET: z.string().min(32),
  APP_SESSION_TTL: z.string().min(1),
  DATABASE_URL: z.url(),

  WORKOS_API_KEY: z.string(),
  WORKOS_CLIENT_ID: z.string(),
})

export const serverEnv = serverEnvSchema.parse({
  ...process.env,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
