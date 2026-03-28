'use client'

import { Button } from '@/components/ui/button'
import { queryClient } from '@/lib/query-client'
import { signOutAction } from '@/server/auth/session'
import { useAuthenticatedUser, useAuthStore } from '@/store/use-auth-store'
import { useMutation } from '@tanstack/react-query'

export function VaultHomePage() {
  const user = useAuthenticatedUser()
  const clearSession = useAuthStore((state) => state.clearSession)

  const signOutMutation = useMutation({
    mutationFn: () => signOutAction(),
    onSuccess: () => {
      clearSession()
      queryClient.setQueryData(['auth-session'], { user: null })
    },
  })

  return (
    <main className="bg-background text-foreground px-6 py-10">
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
              <span>{user.isVerified ? 'Yes' : 'No'}</span>
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
