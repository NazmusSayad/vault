import { scrypt as nodeScrypt, randomBytes, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(nodeScrypt)

export async function hashPassword(password: string) {
  const salt = randomBytes(16)
  const derived = (await scrypt(password, salt, 64)) as Buffer

  return `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`
}

export async function verifyPassword(data: { hash: string; password: string }) {
  const [algorithm, saltHex, hashHex] = data.hash.split('$')

  if (algorithm !== 'scrypt' || !saltHex || !hashHex) {
    return false
  }

  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const actual = (await scrypt(data.password, salt, expected.length)) as Buffer

  if (actual.length !== expected.length) {
    return false
  }

  return timingSafeEqual(actual, expected)
}
