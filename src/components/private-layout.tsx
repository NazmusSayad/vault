'use client'

import { LoadingPage } from '@/components/loading'
import { useAuthStore } from '@/store/use-auth-store'
import { redirect } from 'next/navigation'
import type { PropsWithChildren } from 'react'

export function PrivateLayout({ children }: PropsWithChildren) {
  const status = useAuthStore((state) => state.status)

  if (status === 'loading') {
    return <LoadingPage />
  }

  if (status === 'authenticated') {
    return children
  }

  redirect('/auth/login')
}
