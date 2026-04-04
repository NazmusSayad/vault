'use client'

import { LoginForm } from '@/features/auth/components/login-form'
import { queryClient } from '@/lib/query-client'
import { getSocialAuthUrlAction } from '@/server/auth/oauth'
import { signInAction } from '@/server/auth/sign-in'
import { useAuthStore } from '@/store/use-auth-store'
import { GithubIcon, GoogleIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function LoginPage() {
  const searchParams = useSearchParams()
  const setSession = useAuthStore((state) => state.setSession)
  const [error, setError] = useState(searchParams.get('error') ?? undefined)
  const [isSocialAuthPending, setIsSocialAuthPending] = useState(false)

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

          <div className="mt-6">
            <LoginForm
              defaultData={{
                email: '',
                password: '',
              }}
              onSubmit={async (data) => {
                setError(undefined)

                try {
                  const result = await signInAction(data)

                  setSession(result.user)
                  queryClient.setQueryData(['auth-session'], {
                    user: result.user,
                  })
                  window.location.assign('/')
                } catch (nextError) {
                  setError(
                    nextError instanceof Error
                      ? nextError.message
                      : 'Could not sign you in.'
                  )
                }
              }}
            />
          </div>

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
                      : 'Could not start GitHub sign in.'
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
                      : 'Could not start Google sign in.'
                  )
                } finally {
                  setIsSocialAuthPending(false)
                }
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
