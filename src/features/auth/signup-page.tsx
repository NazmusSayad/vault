'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { queryClient } from '@/lib/query-client'
import { getSocialAuthUrlAction } from '@/server/auth/oauth'
import {
  confirmSignUpOTPAction,
  requestSignUpOTPAction,
} from '@/server/auth/sign-up'
import { useAuthStore } from '@/store/use-auth-store'
import { GithubIcon, GoogleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

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
  const [otp, setOtp] = useState('')
  const signUpOtpRequestMutation = useMutation({
    mutationFn: requestSignUpOTPAction,
    onMutate: () => {
      setError(undefined)
      setNotice(undefined)
    },
  })
  const confirmSignUpMutation = useMutation({
    mutationFn: confirmSignUpOTPAction,
    onMutate: () => {
      setError(undefined)
      setNotice(undefined)
    },
    onSuccess: (result) => {
      setSession(result.user)
      queryClient.setQueryData(['auth-session'], { user: result.user })
      window.location.assign('/')
    },
  })
  const socialAuthMutation = useMutation({
    mutationFn: (provider: 'github' | 'google') =>
      getSocialAuthUrlAction(provider),
    onSuccess: (result) => {
      window.location.assign(result.url)
    },
  })

  const isBusy =
    signUpOtpRequestMutation.isPending ||
    confirmSignUpMutation.isPending ||
    socialAuthMutation.isPending

  function handleSignUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()
    const name = String(formData.get('name') ?? '').trim()
    const password = String(formData.get('password') ?? '')

    signUpOtpRequestMutation.mutate(
      {
        email,
        name,
        password,
      },
      {
        onError: (nextError) => {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Could not send verification code.'
          )
        },
        onSuccess: (result) => {
          setFlowData({
            email,
            name,
            password,
            tokens: [result.token],
          })
          setOtp('')
          setNotice('Verification code sent to your email.')
        },
      }
    )
  }

  function handleConfirmSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!flowData) {
      return
    }

    confirmSignUpMutation.mutate(
      {
        email: flowData.email,
        name: flowData.name,
        otp,
        password: flowData.password,
        tokens: flowData.tokens,
      },
      {
        onError: (nextError) => {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Could not verify your code.'
          )
        },
      }
    )
  }

  function handleResendCode() {
    if (!flowData) {
      return
    }

    signUpOtpRequestMutation.mutate(
      {
        email: flowData.email,
        name: flowData.name,
        password: flowData.password,
      },
      {
        onError: (nextError) => {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Could not resend verification code.'
          )
        },
        onSuccess: (result) => {
          setFlowData({
            ...flowData,
            tokens: [...flowData.tokens, result.token].slice(-5),
          })
          setOtp('')
          setNotice('A fresh code is on the way.')
        },
      }
    )
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
            <form onSubmit={handleConfirmSubmit} className="mt-6 space-y-4">
              <div className="border-border bg-background rounded-2xl border p-4 text-sm">
                <div className="font-medium">{flowData.email}</div>
                <div className="text-muted-foreground mt-1">
                  Confirm your code to finish account creation.
                </div>
              </div>

              <InputOTP
                maxLength={6}
                value={otp}
                onChange={setOtp}
                disabled={isBusy}
                containerClassName="w-full justify-center gap-2"
              >
                <InputOTPGroup className="gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <InputOTPSlot
                      key={index}
                      index={index}
                      className="bg-background border-input h-12 w-12 rounded-lg border text-lg"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button
                type="submit"
                className="w-full"
                disabled={isBusy || otp.length !== 6}
              >
                Create account
                {confirmSignUpMutation.isPending && <Spinner />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground w-full"
                disabled={isBusy}
                onClick={handleResendCode}
              >
                Resend code
                {signUpOtpRequestMutation.isPending && <Spinner />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground w-full"
                disabled={isBusy}
                onClick={() => {
                  setFlowData(null)
                  setOtp('')
                  setError(undefined)
                  setNotice(undefined)
                }}
              >
                Back
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="mt-6 space-y-4">
              <Input
                name="name"
                placeholder="Your name"
                required
                disabled={isBusy}
              />
              <Input
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                disabled={isBusy}
              />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
                disabled={isBusy}
              />

              <Button type="submit" className="w-full" disabled={isBusy}>
                Continue
                {signUpOtpRequestMutation.isPending && <Spinner />}
              </Button>
            </form>
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
                  disabled={isBusy}
                  onClick={() => {
                    socialAuthMutation.mutate('github', {
                      onError: (nextError) => {
                        setError(
                          nextError instanceof Error
                            ? nextError.message
                            : 'Could not start GitHub sign up.'
                        )
                      },
                    })
                  }}
                >
                  <HugeiconsIcon icon={GithubIcon} size={20} />
                </button>

                <button
                  type="button"
                  aria-label="Continue with Google"
                  className="border-border bg-background hover:bg-muted flex size-12 items-center justify-center rounded-full border transition-colors"
                  disabled={isBusy}
                  onClick={() => {
                    socialAuthMutation.mutate('google', {
                      onError: (nextError) => {
                        setError(
                          nextError instanceof Error
                            ? nextError.message
                            : 'Could not start Google sign up.'
                        )
                      },
                    })
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
