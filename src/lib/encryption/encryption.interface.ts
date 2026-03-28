type Options = {
  key: string
  data: string
  algorithm: string
}

export interface EncryptionInterface {
  encrypt(options: Options): Promise<string>
  decrypt(options: Options): Promise<string>
}
