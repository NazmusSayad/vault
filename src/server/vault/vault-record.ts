'use server'

import { createHmac, timingSafeEqual } from 'node:crypto'

import { serverEnv } from '@/env.server'
import { EncryptionServer } from '@/lib/encryption/encryption.server'
import { requireCurrentSessionUser } from '@/server/auth/session'
import { prisma } from '@/server/db'
import { z } from 'zod'

const encryption = new EncryptionServer()

const createVaultRecordSchema = z.object({
  auth: z.string().trim().min(1, 'Enter a vault PIN.'),
  data: z.string().trim().min(1, 'Record data is required.'),
  name: z.string().trim().min(1, 'Enter a record name.'),
  type: z.string().trim().min(1, 'Type is required.'),
  vaultId: z.string().trim().min(1, 'Vault is required.'),
})

const updateVaultRecordSchema = z.object({
  auth: z.string().trim().min(1, 'Enter a vault PIN.'),
  data: z.string().trim().min(1, 'Record data is required.'),
  name: z.string().trim().min(1, 'Enter a record name.'),
  recordId: z.string().trim().min(1, 'Record is required.'),
  type: z.string().trim().min(1, 'Type is required.'),
  vaultId: z.string().trim().min(1, 'Vault is required.'),
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

async function encryptVaultRecordData(data: string) {
  return encryption.encrypt({
    key: serverEnv.VAULT_ENCRYPTION_KEY,
    data,
  })
}

function serializeVaultRecordListItem(record: {
  id: string
  name: string
  type: string
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

async function getOwnedVault(vaultId: string, ownerId: string) {
  const vault = await prisma.vault.findFirst({
    where: {
      id: vaultId,
      ownerId,
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

  return vault
}

export async function createVaultRecordAction(
  input: z.infer<typeof createVaultRecordSchema>
) {
  const user = await requireCurrentSessionUser()
  const body = createVaultRecordSchema.parse(input)
  const vault = await getOwnedVault(body.vaultId, user.id)

  requireValidVaultAuth({
    auth: body.auth,
    authHash: vault.testAuthHash,
  })

  const record = await prisma.vaultRecord.create({
    data: {
      data: await encryptVaultRecordData(body.data),
      name: body.name,
      type: body.type,
      vaultId: body.vaultId,
    },
  })

  return {
    record: serializeVaultRecordListItem(record),
  }
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

  requireValidVaultAuth({
    auth: body.auth,
    authHash: existingRecord.vault.testAuthHash,
  })

  const record = await prisma.vaultRecord.update({
    where: {
      id: existingRecord.id,
    },
    data: {
      data: await encryptVaultRecordData(body.data),
      name: body.name,
      type: body.type,
    },
  })

  return {
    record: serializeVaultRecordListItem(record),
  }
}
