'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { ConfirmRegisterForm } from '@/features/auth/components/confirm-register-form'
import { RequestRegisterForm } from '@/features/auth/components/request-register-form'
import { queryClient } from '@/lib/query-client'
import { getSocialAuthUrlAction } from '@/server/auth/oauth'
import {
  confirmSignUpOTPAction,
  requestSignUpOTPAction,
} from '@/server/auth/sign-up'
import { useAuthStore } from '@/store/use-auth-store'
import { GithubIcon, GoogleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useState } from 'react'

type SignUpFlowData = {
  email: string
  name: string
  password: string
  tokens: string[]
}

export function SignupPage() {
  const setSession = useAuthStore((state) => state.setSession)
  const [error, setError] = useState<string | undefined>()
  const [notice, setNotice] = useState<string | undefined>()
  const [flowData, setFlowData] = useState<SignUpFlowData | null>(null)
  const [isResendingCode, setIsResendingCode] = useState(false)
  const [isSocialAuthPending, setIsSocialAuthPending] = useState(false)

  async function handleSignUpSubmit(data: {
    email: string
    name: string
    password: string
  }) {
    setError(undefined)
    setNotice(undefined)

    try {
      const result = await requestSignUpOTPAction({
        email: data.email,
        name: data.name,
        password: data.password,
      })

      setFlowData({
        email: data.email,
        name: data.name,
        password: data.password,
        tokens: [result.token],
      })
      setNotice('Verification code sent to your email.')
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Could not send verification code.'
      )
    }
  }

  async function handleConfirmSubmit(data: { otp: string }) {
    if (!flowData) {
      return
    }

    setError(undefined)
    setNotice(undefined)

    try {
      const result = await confirmSignUpOTPAction({
        email: flowData.email,
        name: flowData.name,
        otp: data.otp,
        password: flowData.password,
        tokens: flowData.tokens,
      })

      setSession(result.user)
      queryClient.setQueryData(['auth-session'], { user: result.user })
      window.location.assign('/')
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : 'Could not verify your code.'
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
      const result = await requestSignUpOTPAction({
        email: flowData.email,
        name: flowData.name,
        password: flowData.password,
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
          : 'Could not resend verification code.'
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
            <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
            <p className="text-muted-foreground text-sm">
              {flowData
                ? 'Enter the 6-digit code we emailed you.'
                : 'Create your account.'}
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
                  Confirm your code to finish account creation.
                </div>
              </div>

              <ConfirmRegisterForm
                key={flowData.tokens.length}
                defaultData={{
                  otp: '',
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
              <RequestRegisterForm
                defaultData={{
                  email: '',
                  name: '',
                  password: '',
                }}
                onSubmit={handleSignUpSubmit}
              />
            </div>
          )}

          {!flowData && (
            <>
              <div className="text-muted-foreground mt-8 flex items-center gap-3 text-sm">
                <div className="bg-border h-px flex-1" />
                <span>Or continue with</span>
                <div className="bg-border h-px flex-1" />
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <button
                  type="button"
                  aria-label="Continue with GitHub"
                  className="border-border bg-background hover:bg-muted flex size-12 items-center justify-center rounded-full border transition-colors"
                  disabled={isSocialAuthPending}
                  onClick={async () => {
                    setError(undefined)
                    setIsSocialAuthPending(true)

                    try {
                      const result = await getSocialAuthUrlAction('github')
                      window.location.assign(result.url)
                    } catch (nextError) {
                      setError(
                        nextError instanceof Error
                          ? nextError.message
                          : 'Could not start GitHub sign up.'
                      )
                    } finally {
                      setIsSocialAuthPending(false)
                    }
                  }}
                >
                  <HugeiconsIcon icon={GithubIcon} size={20} />
                </button>

                <button
                  type="button"
                  aria-label="Continue with Google"
                  className="border-border bg-background hover:bg-muted flex size-12 items-center justify-center rounded-full border transition-colors"
                  disabled={isSocialAuthPending}
                  onClick={async () => {
                    setError(undefined)
                    setIsSocialAuthPending(true)

                    try {
                      const result = await getSocialAuthUrlAction('google')
                      window.location.assign(result.url)
                    } catch (nextError) {
                      setError(
                        nextError instanceof Error
                          ? nextError.message
                          : 'Could not start Google sign up.'
                      )
                    } finally {
                      setIsSocialAuthPending(false)
                    }
                  }}
                >
                  <HugeiconsIcon icon={GoogleIcon} size={20} />
                </button>
              </div>
            </>
          )}

          <p className="text-muted-foreground mt-8 text-sm">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
