import 'server-only'

import { serverEnv } from '@/env.server'
import { EncryptionServer } from '@/lib/encryption/encryption.server'

type RecordData = {
  data?: string | null
  metadata?: string | null
}

const encryption = new EncryptionServer()

export async function encryptRecordServer({
  data,
  metadata,
}: RecordData): Promise<RecordData> {
  return {
    data: data
      ? await encryption.encrypt({ key: serverEnv.VAULT_ENCRYPTION_KEY, data })
      : undefined,

    metadata: metadata
      ? await encryption.encrypt({
          key: serverEnv.VAULT_ENCRYPTION_KEY,
          data: metadata,
        })
      : undefined,
  }
}

export async function decryptRecordServer(
  input: RecordData
): Promise<RecordData> {
  return {
    data:
      typeof input.data === 'string'
        ? await encryption.decrypt({
            key: serverEnv.VAULT_ENCRYPTION_KEY,
            data: input.data,
          })
        : undefined,

    metadata:
      typeof input.metadata === 'string'
        ? await encryption.decrypt({
            key: serverEnv.VAULT_ENCRYPTION_KEY,
            data: input.metadata,
          })
        : undefined,
  }
}
