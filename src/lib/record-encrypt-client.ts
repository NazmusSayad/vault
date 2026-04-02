'use client'

import z from 'zod'
import { EncryptionClient } from './encryption/encryption.client'

const encryption = new EncryptionClient()

type EncryptedRecord = { data?: string | null; metadata?: string | null }

export const PublicRecordDataSchema = z.record(z.string(), z.string())
export const PublicRecordMetadataSchema = z.array(
  z.tuple([z.string(), z.string()])
)

export async function encryptRecordClient({
  key,
  data,
  metadata,
}: {
  key: string
  data?: z.infer<typeof PublicRecordDataSchema>
  metadata?: z.infer<typeof PublicRecordMetadataSchema>
}): Promise<EncryptedRecord> {
  return {
    data: data
      ? await encryption.encrypt({ key: key, data: JSON.stringify(data) })
      : undefined,

    metadata: metadata
      ? await encryption.encrypt({ key: key, data: JSON.stringify(metadata) })
      : undefined,
  }
}

export async function decryptRecordClient({
  key,
  data,
  metadata,
}: EncryptedRecord & { key: string }) {
  return {
    data:
      typeof data === 'string'
        ? PublicRecordDataSchema.parse(
            JSON.parse(await encryption.decrypt({ key: key, data: data }))
          )
        : undefined,

    metadata:
      typeof metadata === 'string'
        ? PublicRecordMetadataSchema.parse(
            JSON.parse(await encryption.decrypt({ key: key, data: metadata }))
          )
        : undefined,
  }
}
