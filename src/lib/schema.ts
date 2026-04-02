import z from 'zod'

export const SessionUser = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  avatarUrl: z.string().optional(),
})

export const PublicVault = z.object({
  id: z.string(),

  createdAt: z.string(),
  updatedAt: z.string(),

  name: z.string(),
  icon: z.string().optional(),
})

export const PublicRecord = z.object({
  id: z.string(),

  createdAt: z.string(),
  updatedAt: z.string(),

  name: z.string(),
  type: z.string().optional(),

  data: z.record(z.string(), z.string()).optional(),
  metadata: z.array(z.tuple([z.string(), z.string()])).optional(),
})

export type SessionUserType = z.infer<typeof SessionUser>
export type PublicVaultType = z.infer<typeof PublicVault>
export type PublicRecordType = z.infer<typeof PublicRecord>
