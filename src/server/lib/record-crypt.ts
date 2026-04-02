import 'server-only'

import { PublicRecordDataType, PublicRecordMetadataType } from '@/lib/schema'

type EncryptRecordInput = {
  data?: PublicRecordDataType | null
  metadata?: PublicRecordMetadataType | null
}

type EncryptRecordOutput = {
  data?: string
  metadata?: string
}

export async function encryptRecord({
  data,
  metadata,
}: EncryptRecordInput): Promise<EncryptRecordOutput> {
  return {
    data: data ? JSON.stringify(data) : undefined,
    metadata: metadata ? JSON.stringify(metadata) : undefined,
  }
}

type DecryptRecordInput = {
  data?: string | null
  metadata?: string | null
}

type DecryptRecordOutput = {
  data?: PublicRecordDataType
  metadata?: PublicRecordMetadataType
}

export async function decryptRecord(
  input: DecryptRecordInput
): Promise<DecryptRecordOutput> {
  return {
    data: typeof input.data === 'string' ? JSON.parse(input.data) : undefined,

    metadata:
      typeof input.metadata === 'string'
        ? JSON.parse(input.metadata)
        : undefined,
  }
}
