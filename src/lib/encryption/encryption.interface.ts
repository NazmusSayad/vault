type EncryptionOptions = {
  /**
   * The key used for encryption or decryption. This is the secret that should be shared between the encrypting and decrypting parties.
   */
  key: string

  /**
   * The plaintext data to be encrypted.
   */
  data: string
}

export interface EncryptionInterface {
  encrypt(options: EncryptionOptions): Promise<string>
  decrypt(options: EncryptionOptions): Promise<string>
}
