import { z } from 'zod'

const serverEnvSchema = z.object({
  APP_URL: z.url(),

  DATABASE_URL: z.url(),

  JWT_SESSION_SECRET: z.string(),
  JWT_REGISTER_SECRET: z.string(),
  JWT_RESET_PASSWORD_SECRET: z.string(),

  VAULT_HASH_KEY: z.string(),
  VAULT_ENCRYPTION_KEY: z.string(),

  OAUTH_GOOGLE_CLIENT_ID: z.string(),
  OAUTH_GOOGLE_CLIENT_SECRET: z.string(),

  OAUTH_GITHUB_CLIENT_ID: z.string(),
  OAUTH_GITHUB_CLIENT_SECRET: z.string(),

  GMAIL_ADDRESS: z.email(),
  GMAIL_PASSWORD: z.string(),
})

export const serverEnv = serverEnvSchema.parse({
  ...process.env,
  APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})
