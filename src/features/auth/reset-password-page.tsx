'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resetPasswordAction } from '@/server/auth/password-reset'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

export function ResetPasswordPage() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [error, setError] = useState(searchParams.get('error') ?? undefined)
  const resetPasswordMutation = useMutation({
    mutationFn: resetPasswordAction,
    onMutate: () => {
      setError(undefined)
    },
    onSuccess: (result) => {
      if (result.redirectTo) {
        window.location.assign(result.redirectTo)
      }
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    resetPasswordMutation.mutate(
      {
        newPassword: String(formData.get('newPassword') ?? ''),
        token,
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

  return (
    <main className="bg-background text-foreground min-h-screen px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="border-border bg-card rounded-3xl border p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">
              Reset password
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your new password.
            </p>
          </div>

          {error && (
            <div className="border-destructive/20 bg-destructive/10 mt-6 rounded-2xl border px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {!token && (
            <div className="border-destructive/20 bg-destructive/10 mt-6 rounded-2xl border px-4 py-3 text-sm">
              This reset link is missing its token.
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              name="newPassword"
              type="password"
              placeholder="Password"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={!token || resetPasswordMutation.isPending}
            >
              Reset password
            </Button>
          </form>

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
