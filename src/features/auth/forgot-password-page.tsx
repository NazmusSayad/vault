'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { forgotPasswordAction } from '@/server/auth/password-reset'
import { useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'

type FeedbackState = {
  error?: string
  notice?: string
}

export function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const [feedback, setFeedback] = useState<FeedbackState>({
    error: searchParams.get('error') ?? undefined,
    notice: searchParams.get('notice') ?? undefined,
  })
  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPasswordAction,
    onMutate: () => {
      setFeedback({})
    },
    onSuccess: (result) => {
      setFeedback({ notice: result.notice })
    },
  })

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const formData = new FormData(event.currentTarget)

    forgotPasswordMutation.mutate(
      {
        email: String(formData.get('email') ?? '').trim(),
      },
      {
        onError: (error) => {
          setFeedback({
            error:
              error instanceof Error
                ? error.message
                : 'Could not start the password reset flow.',
          })
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
              Forgot password
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your email to get a reset link.
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

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              name="email"
              type="email"
              placeholder="name@company.com"
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={forgotPasswordMutation.isPending}
            >
              Send reset link
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
