'use server'

import { prisma } from '@/server/.db'
import { RecordType } from '@/server/.db/enums'
import { requireCurrentSessionUser } from '@/server/auth/session'
import { z } from 'zod'

const vaultRecordDataItemSchema = z.object({
  key: z.string().trim().min(1, 'Each record field needs a key.'),
  value: z.string(),
})

const vaultRecordDataSchema = z
  .array(vaultRecordDataItemSchema)
  .min(1, 'Add at least one record field.')

const vaultRecordTypeSchema = z.enum([
  RecordType.PASSWORD,
  RecordType.API_KEY,
  RecordType.NOTE,
])

const getVaultRecordsSchema = z.object({
  vaultId: z.string().trim().min(1, 'Vault is required.'),
})

const getVaultRecordSchema = z.object({
  recordId: z.string().trim().min(1, 'Record is required.'),
  vaultId: z.string().trim().min(1, 'Vault is required.'),
})

const createVaultRecordSchema = z.object({
  data: vaultRecordDataSchema,
  name: z.string().trim().min(1, 'Enter a record name.'),
  type: vaultRecordTypeSchema,
  vaultId: z.string().trim().min(1, 'Vault is required.'),
})

const updateVaultRecordSchema = z.object({
  data: vaultRecordDataSchema,
  name: z.string().trim().min(1, 'Enter a record name.'),
  recordId: z.string().trim().min(1, 'Record is required.'),
  type: vaultRecordTypeSchema,
  vaultId: z.string().trim().min(1, 'Vault is required.'),
})

function serializeVaultSummary(vault: {
  id: string
  icon: string | null
  name: string
}) {
  return {
    id: vault.id,
    icon: vault.icon,
    name: vault.name,
  }
}

function serializeVaultRecord(record: {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  type: keyof typeof RecordType
  data: unknown
  vaultId: string
}) {
  return {
    id: record.id,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    name: record.name,
    type: record.type,
    data: vaultRecordDataSchema.parse(record.data),
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
    },
  })

  if (!vault) {
    throw new Error('Vault not found.')
  }

  return vault
}

export async function getVaultRecordsAction(
  input: z.infer<typeof getVaultRecordsSchema>
) {
  const user = await requireCurrentSessionUser()
  const body = getVaultRecordsSchema.parse(input)
  const vault = await getOwnedVault(body.vaultId, user.id)
  const records = await prisma.vaultRecord.findMany({
    where: {
      vaultId: body.vaultId,
      vault: {
        ownerId: user.id,
      },
    },
    orderBy: [{ updatedAt: 'desc' }],
  })

  return {
    records: records.map(serializeVaultRecord),
    vault: serializeVaultSummary(vault),
  }
}

export async function getVaultRecordAction(
  input: z.infer<typeof getVaultRecordSchema>
) {
  const user = await requireCurrentSessionUser()
  const body = getVaultRecordSchema.parse(input)
  const record = await prisma.vaultRecord.findFirst({
    where: {
      id: body.recordId,
      vaultId: body.vaultId,
      vault: {
        ownerId: user.id,
      },
    },
    include: {
      vault: {
        select: {
          icon: true,
          id: true,
          name: true,
        },
      },
    },
  })

  if (!record) {
    throw new Error('Record not found.')
  }

  return {
    record: serializeVaultRecord(record),
    vault: serializeVaultSummary(record.vault),
  }
}

export async function createVaultRecordAction(
  input: z.infer<typeof createVaultRecordSchema>
) {
  const user = await requireCurrentSessionUser()
  const body = createVaultRecordSchema.parse(input)

  await getOwnedVault(body.vaultId, user.id)

  const record = await prisma.vaultRecord.create({
    data: {
      data: body.data,
      name: body.name,
      type: body.type,
      vaultId: body.vaultId,
    },
  })

  return {
    record: serializeVaultRecord(record),
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
    },
  })

  if (!existingRecord) {
    throw new Error('Record not found.')
  }

  const record = await prisma.vaultRecord.update({
    where: {
      id: existingRecord.id,
    },
    data: {
      data: body.data,
      name: body.name,
      type: body.type,
    },
  })

  return {
    record: serializeVaultRecord(record),
  }
}
