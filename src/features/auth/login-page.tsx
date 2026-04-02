'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { queryClient } from '@/lib/query-client'
import { getSocialAuthUrlAction } from '@/server/auth/oauth'
import { signInAction } from '@/server/auth/sign-in'
import { useAuthStore } from '@/store/use-auth-store'
import { GithubIcon, GoogleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

export function LoginPage() {
  const searchParams = useSearchParams()
  const setSession = useAuthStore((state) => state.setSession)
  const [error, setError] = useState(searchParams.get('error') ?? undefined)
  const signInMutation = useMutation({
    mutationFn: signInAction,
    onMutate: () => {
      setError(undefined)
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
  const isBusy = signInMutation.isPending || socialAuthMutation.isPending

  function handleSignInSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    signInMutation.mutate(
      {
        email: String(formData.get('email') ?? '').trim(),
        password: String(formData.get('password') ?? ''),
      },
      {
        onError: (nextError) => {
          setError(
            nextError instanceof Error
              ? nextError.message
              : 'Could not sign you in.'
          )
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

          {error && (
            <div className="border-destructive/20 bg-destructive/10 mt-6 rounded-2xl border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignInSubmit} className="mt-6 space-y-4">
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
              Sign in
              {signInMutation.isPending && <Spinner />}
            </Button>
          </form>

          <div className="mt-4">
            <Link
              href="/auth/forgot-password"
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
              disabled={isBusy}
              onClick={() => {
                socialAuthMutation.mutate('github', {
                  onError: (nextError) => {
                    setError(
                      nextError instanceof Error
                        ? nextError.message
                        : 'Could not start GitHub sign in.'
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
                        : 'Could not start Google sign in.'
                    )
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
              href="/auth/signup"
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
