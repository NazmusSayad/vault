import 'server-only'

import { serverEnv } from '@/env.server'
import OneTimeJwt from 'one-time-jwt'

class OneTimeJwtGenerator<T> {
  type: string
  oneTimeJwt: OneTimeJwt

  constructor(type: string, secret: string) {
    this.type = type
    this.oneTimeJwt = new OneTimeJwt(secret)
  }

  async createToken(payload: T) {
    return await this.oneTimeJwt.createToken<T & { iat: number }>(
      this.type,
      {
        ...payload,
        iat: Math.floor(Date.now() / 1000),
      },
      {
        otpLength: 6,
        expiresIn: '10m',
        otpType: 'digits',
      }
    )
  }

  async verifyToken(tokens: string[], otp: string) {
    return await this.oneTimeJwt.verifyToken<T & { iat: number }>(
      this.type,
      tokens,
      { otp }
    )
  }
}

type RegisterOTPTokenPayload = {
  email: string
}

type ResetPasswordOTPTokenPayload = {
  email: string
  userId: string
}

export const registerOTPGenerator =
  new OneTimeJwtGenerator<RegisterOTPTokenPayload>(
    'register',
    serverEnv.JWT_REGISTER_SECRET
  )

export const resetPasswordOTPGenerator =
  new OneTimeJwtGenerator<ResetPasswordOTPTokenPayload>(
    'reset-password',
    serverEnv.JWT_RESET_PASSWORD_SECRET
  )
