import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from 'node:crypto'

import { EncryptionInterface } from './encryption.interface'

const algorithm = 'aes-256-gcm'
const ivLength = 12
const keyLength = 32
const saltLength = 16
const separator = ':'
const version = 'aes-256-gcm-v1'

function deriveKey(key: string, salt: Buffer) {
  return scryptSync(key, salt, keyLength)
}

function parsePayload(payload: string) {
  const parts = payload.split(separator)

  if (parts.length !== 5 || parts[0] !== version) {
    throw new Error('Invalid encrypted payload')
  }

  return parts
}

export class EncryptionServer implements EncryptionInterface {
  async encrypt({ key, data }: { key: string; data: string }) {
    const salt = randomBytes(saltLength)
    const iv = randomBytes(ivLength)
    const cipher = createCipheriv(algorithm, deriveKey(key, salt), iv)
    const encrypted = Buffer.concat([
      cipher.update(data, 'utf8'),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()

    return [
      version,
      salt.toString('base64'),
      iv.toString('base64'),
      tag.toString('base64'),
      encrypted.toString('base64'),
    ].join(separator)
  }

  async decrypt({ key, data }: { key: string; data: string }) {
    const [, salt, iv, tag, encrypted] = parsePayload(data)
    const decipher = createDecipheriv(
      algorithm,
      deriveKey(key, Buffer.from(salt, 'base64')),
      Buffer.from(iv, 'base64')
    )

    decipher.setAuthTag(Buffer.from(tag, 'base64'))

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64')),
      decipher.final(),
    ])

    return decrypted.toString('utf8')
  }
}
