'use server'

import { serverEnv } from '@/env.server'
import { PublicRecord, PublicVault } from '@/lib/schema'
import { requireCurrentSessionUser } from '@/server/auth/session'
import { prisma } from '@/server/db'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { z } from 'zod'
import {
  decryptRecordServer,
  encryptRecordServer,
} from '../lib/record-crypt-server'

const createVaultRecordSchema = z.object({
  auth: z.string().trim().min(1, 'Enter a vault PIN.'),
  name: z.string().trim().min(1, 'Enter a record name.'),
  vaultId: z.string().trim().min(1, 'Vault is required.'),

  type: z.string().optional(),
  data: z.string().optional(),
  metadata: z.string().optional(),
})

const updateVaultRecordSchema = z.object({
  name: z.string().trim().min(1, 'Enter a record name.'),
  recordId: z.string().trim().min(1, 'Record is required.'),
  vaultId: z.string().trim().min(1, 'Vault is required.'),

  type: z.string().optional(),
  data: z.string().optional(),
  metadata: z.string().optional(),
})

const getVaultRecordsSchema = z.object({
  vaultId: z.string().trim().min(1, 'Vault is required.'),
  auth: z.string().trim().min(1, 'Enter a vault PIN.'),
})

function createVaultAuthHash(auth: string) {
  return createHmac('sha256', serverEnv.VAULT_HASH_KEY)
    .update(auth)
    .digest('hex')
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
    throw new Error('Invalid vault PIN.')
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
        select: {
          data: true,
          metadata: true,

          id: true,
          name: true,
          type: true,
          createdAt: true,
          updatedAt: true,
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

  const records = await Promise.all(
    vault.vaultRecords.map(async (record) => {
      return PublicRecord.parse({
        ...record,
        ...(await decryptRecordServer(record)),
      })
    })
  )

  return {
    records,
    vault: PublicVault.parse(vault),
  }
}

export async function createVaultRecordAction(
  input: z.infer<typeof createVaultRecordSchema>
) {
  const user = await requireCurrentSessionUser()
  const body = createVaultRecordSchema.parse(input)

  const vault = await prisma.vault.findFirst({
    where: {
      id: body.vaultId,
      ownerId: user.id,
    },
    select: {
      icon: true,
      id: true,
      name: true,
      testAuthHash: true,
    },
  })

  if (!vault) {
    throw new Error('Vault not found.')
  }

  requireValidVaultAuth({
    auth: body.auth,
    authHash: vault.testAuthHash,
  })

  await prisma.vaultRecord.create({
    data: {
      name: body.name,
      type: body.type,
      vaultId: body.vaultId,
      ...(await encryptRecordServer(body)),
    },
  })
}

export async function updateVaultRecordAction(
  input: z.infer<typeof updateVaultRecordSchema>
) {
  const user = await requireCurrentSessionUser()
  const body = updateVaultRecordSchema.parse(input)
  const existingRecord = await prisma.vaultRecord.findFirst({
    where: {
      id: body.recordId,
      vaultId: body.vaultId,
      vault: {
        ownerId: user.id,
      },
    },
    select: {
      id: true,
      vault: {
        select: {
          testAuthHash: true,
        },
      },
    },
  })

  if (!existingRecord) {
    throw new Error('Record not found.')
  }

  await prisma.vaultRecord.update({
    where: { id: existingRecord.id },
    data: {
      name: body.name,
      type: body.type,
      ...(await encryptRecordServer(body)),
    },
  })
}
