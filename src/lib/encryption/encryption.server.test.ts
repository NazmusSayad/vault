import { describe, expect, it } from 'vitest'

import { EncryptionServer } from './encryption.server'

describe('EncryptionServer', () => {
  const encryption = new EncryptionServer()
  const key = 'server-secret-key'
  const text = 'top secret server payload'

  it('round-trips encrypted text', async () => {
    const encrypted = await encryption.encrypt({ key, data: text })
    const decrypted = await encryption.decrypt({ key, data: encrypted })

    expect(encrypted).not.toBe(text)
    expect(decrypted).toBe(text)
  })

  it('produces unique payloads for the same text', async () => {
    const first = await encryption.encrypt({ key, data: text })
    const second = await encryption.encrypt({ key, data: text })

    expect(first).not.toBe(second)
  })

  it('rejects the wrong key', async () => {
    const encrypted = await encryption.encrypt({ key, data: text })

    await expect(
      encryption.decrypt({ key: 'wrong-server-key', data: encrypted })
    ).rejects.toThrow()
  })

  it('rejects malformed payloads', async () => {
    await expect(
      encryption.decrypt({ key, data: 'not-a-valid-payload' })
    ).rejects.toThrow('Invalid encrypted payload')
  })
})
