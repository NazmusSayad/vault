'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { queryClient } from '@/lib/query-client'
import { signUpAction } from '@/server/auth/sign-up'
import { getSocialAuthUrlAction } from '@/server/auth/social'
import { verifyEmailAction } from '@/server/auth/verification'
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

export function SignupPage() {
  const searchParams = useSearchParams()
  const setSession = useAuthStore((state) => state.setSession)
  const [feedback, setFeedback] = useState<FeedbackState>({
    error: searchParams.get('error') ?? undefined,
    notice: searchParams.get('notice') ?? undefined,
    pendingEmail: searchParams.get('pendingEmail') ?? undefined,
  })
  const signUpMutation = useMutation({
    mutationFn: signUpAction,
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

  function handleSignUpSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    signUpMutation.mutate(
      {
        email: String(formData.get('email') ?? '').trim(),
        name: String(formData.get('name') ?? '').trim(),
        password: String(formData.get('password') ?? ''),
      },
      {
        onError: (error) => {
          setFeedback({
            error:
              error instanceof Error ? error.message : 'Could not sign you up.',
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
            <h1 className="text-3xl font-semibold tracking-tight">Sign up</h1>
            <p className="text-muted-foreground text-sm">
              Create your account.
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

          <form onSubmit={handleSignUpSubmit} className="mt-6 space-y-4">
            <Input name="name" placeholder="Your name" required />
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
              disabled={signUpMutation.isPending}
            >
              Sign up
            </Button>
          </form>

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
                          : 'Could not start GitHub sign up.',
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
                          : 'Could not start Google sign up.',
                    })
                  },
                })
              }}
            >
              <HugeiconsIcon icon={GoogleIcon} size={20} />
            </button>
          </div>

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
