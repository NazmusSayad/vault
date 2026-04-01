'use server'

import { createHmac, timingSafeEqual } from 'node:crypto'

import { serverEnv } from '@/env.server'
import { requireCurrentSessionUser } from '@/server/auth/session'
import { prisma } from '@/server/db'
import type { RecordType } from '@/server/db/.prisma/enums'
import { z } from 'zod'

const invalidVaultAuthMessage = 'Invalid vault PIN.'

const getVaultSchema = z.object({
  vaultId: z.string().trim().min(1, 'Vault is required.'),
})

const getVaultRecordsSchema = z.object({
  vaultId: z.string().trim().min(1, 'Vault is required.'),
  auth: z.string().trim().min(1, 'Enter a vault PIN.'),
})

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

function hashVaultAuth(auth: string) {
  return createVaultAuthHash(auth)
}

function requireValidVaultAuth({
  auth,
  authHash,
}: {
  auth: string
  authHash: string
}) {
  const expectedHash = Buffer.from(authHash, 'utf8')
  const actualHash = Buffer.from(createVaultAuthHash(auth), 'utf8')

  if (
    expectedHash.length !== actualHash.length ||
    !timingSafeEqual(expectedHash, actualHash)
  ) {
    throw new Error(invalidVaultAuthMessage)
  }
}

function serializeVault(vault: {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  icon: string | null
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
    lastAccessedAt: vault.lastAccessedAt?.toISOString() ?? null,
    recordCount: vault._count?.vaultRecords ?? 0,
  }
}

function serializeVaultRecord(record: {
  id: string
  name: string
  type: RecordType
  updatedAt: Date
  vaultId: string
}) {
  return {
    id: record.id,
    name: record.name,
    type: record.type,
    updatedAt: record.updatedAt.toISOString(),
    vaultId: record.vaultId,
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
      vaultRecords: {
        orderBy: [{ updatedAt: 'desc' }],
        select: {
          id: true,
          name: true,
          type: true,
          updatedAt: true,
          vaultId: true,
        },
      },
    },
  })

  if (!vault) {
    throw new Error('Vault not found.')
  }

  return {
    vault: serializeVault(vault),
    records: vault.vaultRecords.map(serializeVaultRecord),
  }
}

export async function getVaultRecordsAction(
  input: z.infer<typeof getVaultRecordsSchema>
) {
  const user = await requireCurrentSessionUser()
  const body = getVaultRecordsSchema.parse(input)

  const vault = await prisma.vault.findFirst({
    where: {
      id: body.vaultId,
      ownerId: user.id,
    },
    include: {
      vaultRecords: {
        orderBy: [{ updatedAt: 'desc' }],
        select: {
          id: true,
          name: true,
          type: true,
          updatedAt: true,
          vaultId: true,
        },
      },
    },
  })

  if (!vault) {
    throw new Error('Vault not found.')
  }

  requireValidVaultAuth({
    auth: body.auth,
    authHash: vault.testAuthHash,
  })

  return {
    vault: serializeVault(vault),
    records: vault.vaultRecords.map(serializeVaultRecord),
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
      testAuthHash: hashVaultAuth(body.auth),
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
