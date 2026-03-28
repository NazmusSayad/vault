'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { queryClient } from '@/lib/query-client'
import { signInAction } from '@/server/auth/sign-in.actions'
import { getSocialAuthUrlAction } from '@/server/auth/social.actions'
import { verifyEmailAction } from '@/server/auth/verification.actions'
import { useAuthStore } from '@/store/use-auth-store'
import { GithubIcon, GoogleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

type FeedbackState = {
  error?: string
  notice?: string
  pendingEmail?: string
}

export default function LoginPage() {
  const searchParams = useSearchParams()
  const setSession = useAuthStore((state) => state.setSession)
  const [feedback, setFeedback] = useState<FeedbackState>({
    error: searchParams.get('error') ?? undefined,
    notice: searchParams.get('notice') ?? undefined,
    pendingEmail: searchParams.get('pendingEmail') ?? undefined,
  })
  const signInMutation = useMutation({
    mutationFn: signInAction,
    onMutate: () => {
      setFeedback({})
    },
    onSuccess: (result) => {
      if ('user' in result && result.user) {
        setSession(result.user)
        queryClient.setQueryData(['auth-session'], { user: result.user })
        window.location.assign('/')
        return
      }

      setFeedback({
        notice: 'notice' in result ? result.notice : undefined,
        pendingEmail:
          'pendingEmail' in result ? result.pendingEmail : undefined,
      })
    },
  })
  const verifyMutation = useMutation({
    mutationFn: verifyEmailAction,
    onSuccess: (result) => {
      if ('user' in result && result.user) {
        setSession(result.user)
        queryClient.setQueryData(['auth-session'], { user: result.user })
        window.location.assign('/')
        return
      }

      setFeedback({
        notice: 'notice' in result ? result.notice : undefined,
        pendingEmail:
          'pendingEmail' in result ? result.pendingEmail : undefined,
      })
    },
  })
  const socialAuthMutation = useMutation({
    mutationFn: (provider: 'GitHubOAuth' | 'GoogleOAuth') =>
      getSocialAuthUrlAction(provider),
    onSuccess: (result) => {
      const { url } = result
      window.location.assign(url)
    },
  })

  function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    signInMutation.mutate(
      {
        email: String(formData.get('email') ?? '').trim(),
        password: String(formData.get('password') ?? ''),
      },
      {
        onError: (error) => {
          setFeedback({
            error:
              error instanceof Error ? error.message : 'Could not sign you in.',
          })
        },
      }
    )
  }

  function handleVerifySubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    verifyMutation.mutate(
      {
        code: String(formData.get('code') ?? '').trim(),
      },
      {
        onError: (error) => {
          setFeedback((current) => ({
            ...current,
            error:
              error instanceof Error
                ? error.message
                : 'Could not verify your email.',
          }))
        },
      }
    )
  }

  return (
    <main className="bg-background text-foreground min-h-screen px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="border-border bg-card rounded-3xl border p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-muted-foreground text-sm">
              Enter your email and password.
            </p>
          </div>

          {(feedback.error || feedback.notice) && (
            <div className="mt-6 space-y-3">
              {feedback.error && (
                <div className="border-destructive/20 bg-destructive/10 rounded-2xl border px-4 py-3 text-sm">
                  {feedback.error}
                </div>
              )}
              {feedback.notice && (
                <div className="border-primary/15 bg-primary/10 rounded-2xl border px-4 py-3 text-sm">
                  {feedback.notice}
                </div>
              )}
            </div>
          )}

          {feedback.pendingEmail && (
            <form onSubmit={handleVerifySubmit} className="mt-6 space-y-4">
              <Input
                name="code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                placeholder="Verification code"
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending}
              >
                Confirm email
              </Button>
            </form>
          )}

          <form onSubmit={handleSignInSubmit} className="mt-6 space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="name@company.com"
              required
            />
            <Input
              name="password"
              type="password"
              placeholder="Password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={signInMutation.isPending}
            >
              Sign in
            </Button>
          </form>

          <div className="mt-4">
            <Link
              href="/forgot-password"
              className="text-primary text-sm underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

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
              disabled={socialAuthMutation.isPending}
              onClick={() => {
                socialAuthMutation.mutate('GitHubOAuth', {
                  onError: (error) => {
                    setFeedback({
                      error:
                        error instanceof Error
                          ? error.message
                          : 'Could not start GitHub sign in.',
                    })
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
              disabled={socialAuthMutation.isPending}
              onClick={() => {
                socialAuthMutation.mutate('GoogleOAuth', {
                  onError: (error) => {
                    setFeedback({
                      error:
                        error instanceof Error
                          ? error.message
                          : 'Could not start Google sign in.',
                    })
                  },
                })
              }}
            >
              <HugeiconsIcon icon={GoogleIcon} size={20} />
            </button>
          </div>

          <p className="text-muted-foreground mt-8 text-sm">
            Need an account?{' '}
            <Link
              href="/signup"
              className="text-primary underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
