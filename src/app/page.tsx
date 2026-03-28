'use client'

import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { queryClient } from '@/lib/query-client'
import { signOutAction } from '@/server/auth/session'
import { useAuthStore } from '@/store/use-auth-store'
import { useMutation } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'

export default function Page() {
  const searchParams = useSearchParams()
  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const clearSession = useAuthStore((state) => state.clearSession)
  const signOutMutation = useMutation({
    mutationFn: () => signOutAction(),
    onSuccess: () => {
      clearSession()
      queryClient.setQueryData(['auth-session'], { user: null })
    },
  })
  const error = searchParams.get('error')
  const notice = searchParams.get('notice')

  if (status === 'loading') {
    return (
      <main className="bg-background text-foreground min-h-screen px-6 py-10">
        <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center">
          <Spinner className="text-muted-foreground size-5" />
        </div>
      </main>
    )
  }

  if (user) {
    return (
      <main className="bg-background text-foreground min-h-screen px-6 py-10">
        <div className="mx-auto max-w-md">
          <div className="border-border bg-card rounded-3xl border p-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight">
                {user.name}
              </h1>
              <p className="text-muted-foreground text-sm">Signed in</p>
            </div>

            <div className="mt-6 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Verified</span>
                <span>{user.userVerified ? 'Yes' : 'No'}</span>
              </div>
            </div>

            <Button
              type="button"
              className="mt-6 w-full"
              variant="outline"
              disabled={signOutMutation.isPending}
              onClick={() => {
                signOutMutation.mutate()
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-background text-foreground min-h-screen px-6 py-10">
      <div className="mx-auto max-w-md">
        <div className="border-border bg-card rounded-3xl border p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">Home</h1>
            <p className="text-muted-foreground text-sm">
              Log in or create an account.
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

          <div className="mt-6 flex flex-col gap-3">
            <Button asChild className="w-full">
              <a href="/auth/login">Login</a>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href="/auth/signup">Sign up</a>
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
