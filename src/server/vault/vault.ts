'use server'

import { prisma } from '@/server/.db'
import { requireCurrentSessionUser } from '@/server/auth/session'
import { z } from 'zod'

const getVaultSchema = z.object({
  vaultId: z.string().trim().min(1, 'Vault is required.'),
})

const createVaultSchema = z.object({
  icon: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Enter a vault name.'),
  testAuthHash: z.string().trim().min(1, 'Enter a vault test auth value.'),
})

function serializeVault(vault: {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  icon: string | null
  testAuthHash: string
  lastAccessedAt: Date | null
  _count?: {
    vaultRecords: number
  }
}) {
  return {
    id: vault.id,
    createdAt: vault.createdAt.toISOString(),
    updatedAt: vault.updatedAt.toISOString(),
    name: vault.name,
    icon: vault.icon,
    testAuthHash: vault.testAuthHash,
    lastAccessedAt: vault.lastAccessedAt?.toISOString() ?? null,
    recordCount: vault._count?.vaultRecords ?? 0,
  }
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
    vaults: vaults.map(serializeVault),
  }
}

export async function getVaultAction(input: z.infer<typeof getVaultSchema>) {
  const user = await requireCurrentSessionUser()
  const body = getVaultSchema.parse(input)
  const vault = await prisma.vault.findFirst({
    where: {
      id: body.vaultId,
      ownerId: user.id,
    },
    include: {
      _count: {
        select: {
          vaultRecords: true,
        },
      },
    },
  })

  if (!vault) {
    throw new Error('Vault not found.')
  }

  return {
    vault: serializeVault(vault),
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
      testAuthHash: body.testAuthHash,
    },
    include: {
      _count: {
        select: {
          vaultRecords: true,
        },
      },
    },
  })

  return {
    vault: serializeVault(vault),
  }
}
