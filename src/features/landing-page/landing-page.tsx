'use client'

import { useAuthStore } from '@/store/use-auth-store'
import { redirect } from 'next/navigation'
import { Hero } from './components/hero'

export function LandingPage({ allowRedirect }: { allowRedirect?: boolean }) {
  const status = useAuthStore((state) => state.status)

  if (allowRedirect && status === 'authenticated') {
    return redirect('/vault')
  }

  return (
    <main>
      <Hero />
    </main>
  )
}
