'use client'

import { queryClient } from '@/lib/query-client'
import { getSessionAction } from '@/server/auth/session'
import { useAuthStore } from '@/store/use-auth-store'
import { QueryClientProvider, useQuery } from '@tanstack/react-query'
import { ThemeProvider, useTheme } from 'next-themes'
import { PropsWithChildren, useEffect } from 'react'
import { Toaster } from 'sonner'

function AuthBootstrap() {
  const clearSession = useAuthStore((state) => state.clearSession)
  const setSession = useAuthStore((state) => state.setSession)
  const sessionQuery = useQuery({
    queryFn: () => getSessionAction(),
    queryKey: ['auth-session'],
    retry: false,
  })

  useEffect(() => {
    if (sessionQuery.data) {
      setSession(sessionQuery.data.user)
      return
    }

    if (sessionQuery.isError) {
      clearSession()
    }
  }, [clearSession, sessionQuery.data, sessionQuery.isError, setSession])

  return null
}

function SonnerToaster() {
  const theme = useTheme()

  return (
    <Toaster
      richColors
      theme={theme.resolvedTheme === 'dark' ? 'dark' : 'light'}
      className="cursor-grab select-none active:cursor-grabbing"
    />
  )
}

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" enableSystem>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />

        {children}

        <SonnerToaster />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
