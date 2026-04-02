import z from 'zod'

export const PublicVault = z.object({
  id: z.string(),

  createdAt: z.string(),
  updatedAt: z.string(),

  name: z.string(),
  icon: z.string().nullable(),
})

export const PublicVaultRecord = z.object({
  id: z.string(),

  createdAt: z.string(),
  updatedAt: z.string(),

  name: z.string(),
  type: z.string(),

  data: z.record(z.string(), z.string()),
  metadata: z.tuple([z.string(), z.string()]).array(),
})

export type PublicVaultType = z.infer<typeof PublicVault>
export type PublicVaultRecordType = z.infer<typeof PublicVaultRecord>
