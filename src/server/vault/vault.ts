'use server'

import { createHmac } from 'node:crypto'

import { serverEnv } from '@/env.server'
import { PublicVault } from '@/lib/schema'
import { requireCurrentSessionUser } from '@/server/auth/session'
import { prisma } from '@/server/db'
import { z } from 'zod'

const createVaultSchema = z.object({
  auth: z.string().trim().min(1, 'Enter a vault PIN.'),
  icon: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Enter a vault name.'),
})

function createVaultAuthHash(auth: string) {
  return createHmac('sha256', serverEnv.VAULT_HASH_KEY)
    .update(auth)
    .digest('hex')
}

export async function getVaultsAction() {
  const user = await requireCurrentSessionUser()
  const vaults = await prisma.vault.findMany({
    where: {
      ownerId: user.id,
    },
    include: {
      _count: {
        select: {
          vaultRecords: true,
        },
      },
    },
    orderBy: [{ updatedAt: 'desc' }],
  })

  return {
    vaults: vaults.map((vault) => PublicVault.parse(vault)),
  }
}

export async function createVaultAction(
  input: z.infer<typeof createVaultSchema>
) {
  const user = await requireCurrentSessionUser()
  const body = createVaultSchema.parse(input)
  const vault = await prisma.vault.create({
    data: {
      icon: body.icon || null,
      name: body.name,
      ownerId: user.id,
      testAuthHash: createVaultAuthHash(body.auth),
    },
  })

  return PublicVault.parse(vault)
}
