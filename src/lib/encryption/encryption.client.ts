import { EncryptionInterface } from './encryption.interface'

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const algorithm = 'AES-GCM'
const iterations = 250000
const ivLength = 12
const saltLength = 16
const separator = ':'
const version = 'aes-gcm-v1'

function bytesToBase64(bytes: Uint8Array) {
  let value = ''

  for (const byte of bytes) {
    value += String.fromCharCode(byte)
  }

  return btoa(value)
}

function base64ToBytes(value: string) {
  const decoded = atob(value)
  const bytes = new Uint8Array(decoded.length)

  for (const [index, character] of Array.from(decoded).entries()) {
    bytes[index] = character.charCodeAt(0)
  }

  return bytes
}

function parsePayload(payload: string) {
  const parts = payload.split(separator)

  if (parts.length !== 4 || parts[0] !== version) {
    throw new Error('Invalid encrypted payload')
  }

  return parts
}

async function deriveKey(key: string, salt: Uint8Array) {
  const normalizedSalt = new Uint8Array(salt.length)

  normalizedSalt.set(salt)

  const material = await crypto.subtle.importKey(
    'raw',
    encoder.encode(key),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      hash: 'SHA-256',
      salt: normalizedSalt,
      iterations,
    },
    material,
    {
      name: algorithm,
      length: 256,
    },
    false,
    ['encrypt', 'decrypt']
  )
}

export class EncryptionClient implements EncryptionInterface {
  async encrypt({ key, data }: { key: string; data: string }) {
    const salt = crypto.getRandomValues(new Uint8Array(saltLength))
    const iv = crypto.getRandomValues(new Uint8Array(ivLength))
    const derivedKey = await deriveKey(key, salt)
    const encrypted = await crypto.subtle.encrypt(
      {
        name: algorithm,
        iv,
      },
      derivedKey,
      encoder.encode(data)
    )

    return [
      version,
      bytesToBase64(salt),
      bytesToBase64(iv),
      bytesToBase64(new Uint8Array(encrypted)),
    ].join(separator)
  }

  async decrypt({ key, data }: { key: string; data: string }) {
    const [, salt, iv, encrypted] = parsePayload(data)
    const derivedKey = await deriveKey(key, base64ToBytes(salt))
    const decrypted = await crypto.subtle.decrypt(
      {
        name: algorithm,
        iv: base64ToBytes(iv),
      },
      derivedKey,
      base64ToBytes(encrypted)
    )

    return decoder.decode(decrypted)
  }
}
