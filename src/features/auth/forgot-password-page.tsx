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
import {
  confirmResetPasswordOTPAction,
  requestResetPasswordOTPAction,
} from '@/server/auth/password-reset'
import { useAuthStore } from '@/store/use-auth-store'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { FormEvent, useState } from 'react'

type ForgotPasswordFlowData = {
  email: string
  tokens: string[]
}

export function ForgotPasswordPage() {
  const setSession = useAuthStore((state) => state.setSession)
  const [flowData, setFlowData] = useState<ForgotPasswordFlowData | null>(null)
  const [error, setError] = useState<string | undefined>()
  const [notice, setNotice] = useState<string | undefined>()
  const [otp, setOtp] = useState('')
  const requestMutation = useMutation({
    mutationFn: requestResetPasswordOTPAction,
    onMutate: () => {
      setError(undefined)
      setNotice(undefined)
    },
  })
  const confirmMutation = useMutation({
    mutationFn: confirmResetPasswordOTPAction,
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
  const isBusy = requestMutation.isPending || confirmMutation.isPending

  function handleRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('email') ?? '').trim()

    requestMutation.mutate(
      {
        email,
      },
      {
        onError: (nextError) => {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Could not send recovery code.'
          )
        },
        onSuccess: (result) => {
          setFlowData({
            email,
            tokens: [result.token],
          })
          setOtp('')
          setNotice('Recovery code sent to your email.')
        },
      }
    )
  }

  function handleConfirmSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!flowData) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const password = String(formData.get('password') ?? '')
    const confirmPassword = String(formData.get('confirmPassword') ?? '')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    confirmMutation.mutate(
      {
        email: flowData.email,
        otp,
        password,
        tokens: flowData.tokens,
      },
      {
        onError: (nextError) => {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Could not reset your password.'
          )
        },
      }
    )
  }

  function handleResendCode() {
    if (!flowData) {
      return
    }

    requestMutation.mutate(
      {
        email: flowData.email,
      },
      {
        onError: (nextError) => {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Could not resend the code.'
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
            <form onSubmit={handleConfirmSubmit} className="mt-6 space-y-4">
              <div className="border-border bg-background rounded-2xl border p-4 text-sm">
                <div className="font-medium">{flowData.email}</div>
                <div className="text-muted-foreground mt-1">
                  Use the latest code we sent you.
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

              <Input
                name="password"
                type="password"
                placeholder="New password"
                minLength={6}
                required
                disabled={isBusy}
              />
              <Input
                name="confirmPassword"
                type="password"
                placeholder="Confirm password"
                minLength={6}
                required
                disabled={isBusy}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isBusy || otp.length !== 6}
              >
                Reset password
                {confirmMutation.isPending && <Spinner />}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-foreground w-full"
                disabled={isBusy}
                onClick={handleResendCode}
              >
                Resend code
                {requestMutation.isPending && <Spinner />}
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
            <form onSubmit={handleRequestSubmit} className="mt-6 space-y-4">
              <Input
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                disabled={isBusy}
              />

              <Button type="submit" className="w-full" disabled={isBusy}>
                Continue
                {requestMutation.isPending && <Spinner />}
              </Button>
            </form>
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
