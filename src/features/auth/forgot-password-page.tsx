'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmForgetPasswordForm } from '@/features/auth/components/confirm-forget-password-form'
import { RequestForgetPasswordForm } from '@/features/auth/components/request-forget-password-form'
import { queryClient } from '@/lib/query-client'
import {
  confirmResetPasswordOTPAction,
  requestResetPasswordOTPAction,
} from '@/server/auth/password-reset'
import { useAuthStore } from '@/store/use-auth-store'
import Link from 'next/link'
import { useState } from 'react'

type ForgotPasswordFlowData = {
  email: string
  tokens: string[]
}

export function ForgotPasswordPage() {
  const setSession = useAuthStore((state) => state.setSession)
  const [flowData, setFlowData] = useState<ForgotPasswordFlowData | null>(null)
  const [error, setError] = useState<string | undefined>()
  const [notice, setNotice] = useState<string | undefined>()
  const [isResendingCode, setIsResendingCode] = useState(false)

  async function handleRequestSubmit(data: { email: string }) {
    setError(undefined)
    setNotice(undefined)

    try {
      const result = await requestResetPasswordOTPAction({
        email: data.email,
      })

      setFlowData({
        email: data.email,
        tokens: [result.token],
      })
      setNotice('Recovery code sent to your email.')
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Could not send recovery code.'
      )
    }
  }

  async function handleConfirmSubmit(data: {
    confirmPassword: string
    otp: string
    password: string
  }) {
    if (!flowData) {
      return
    }

    setError(undefined)
    setNotice(undefined)

    try {
      const result = await confirmResetPasswordOTPAction({
        email: flowData.email,
        otp: data.otp,
        password: data.password,
        tokens: flowData.tokens,
      })

      setSession(result.user)
      queryClient.setQueryData(['auth-session'], { user: result.user })
      window.location.assign('/')
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Could not reset your password.'
      )
    }
  }

  async function handleResendCode() {
    if (!flowData) {
      return
    }

    setError(undefined)
    setNotice(undefined)
    setIsResendingCode(true)

    try {
      const result = await requestResetPasswordOTPAction({
        email: flowData.email,
      })

      setFlowData({
        ...flowData,
        tokens: [...flowData.tokens, result.token].slice(-5),
      })
      setNotice('A fresh code is on the way.')
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Could not resend the code.'
      )
    } finally {
      setIsResendingCode(false)
    }
  }

  return (
    <main className="bg-background text-foreground min-h-screen px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="border-border bg-card rounded-3xl border p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Reset password
            </h1>
            <p className="text-muted-foreground text-sm">
              {flowData
                ? 'Enter the 6-digit code we emailed you.'
                : 'Enter your email and we will send a recovery code.'}
            </p>
          </div>

          {(error || notice) && (
            <div className="mt-6 space-y-3">
              {error && (
                <div className="border-destructive/20 bg-destructive/10 rounded-2xl border px-4 py-3 text-sm">
                  {error}
                </div>
              )}
              {notice && (
                <div className="border-primary/15 bg-primary/10 rounded-2xl border px-4 py-3 text-sm">
                  {notice}
                </div>
              )}
            </div>
          )}

          {flowData ? (
            <div className="mt-6 space-y-4">
              <div className="border-border bg-background rounded-2xl border p-4 text-sm">
                <div className="font-medium">{flowData.email}</div>
                <div className="text-muted-foreground mt-1">
                  Use the latest code we sent you.
                </div>
              </div>

              <ConfirmForgetPasswordForm
                key={flowData.tokens.length}
                defaultData={{
                  confirmPassword: '',
                  otp: '',
                  password: '',
                }}
                onSubmit={handleConfirmSubmit}
              />

              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground w-full"
                disabled={isResendingCode}
                onClick={handleResendCode}
              >
                Resend code
                {isResendingCode && <Spinner />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground w-full"
                disabled={isResendingCode}
                onClick={() => {
                  setFlowData(null)
                  setError(undefined)
                  setNotice(undefined)
                }}
              >
                Back
              </Button>
            </div>
          ) : (
            <div className="mt-6">
              <RequestForgetPasswordForm
                defaultData={{
                  email: '',
                }}
                onSubmit={handleRequestSubmit}
              />
            </div>
          )}

          <div className="mt-6">
            <Link
              href="/auth/login"
              className="text-primary text-sm underline-offset-4 hover:underline"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
