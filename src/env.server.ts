import { z } from 'zod'

const serverEnvSchema = z.object({
  APP_URL: z.url(),

  DATABASE_URL: z.url(),
  APP_SESSION_SECRET: z.string(),

  WORKOS_API_KEY: z.string(),
  WORKOS_CLIENT_ID: z.string(),

  VAULT_HASH_KEY: z.string(),
  VAULT_ENCRYPTION_KEY: z.string(),
})

export const serverEnv = serverEnvSchema.parse({
  ...process.env,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
