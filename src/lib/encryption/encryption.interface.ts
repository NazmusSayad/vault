type EncryptionOptions = {
  key: string
  data: string
}

export interface EncryptionInterface {
  encrypt(options: EncryptionOptions): Promise<string>
  decrypt(options: EncryptionOptions): Promise<string>
}
