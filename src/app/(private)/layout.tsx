import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { PrivateLayoutClient } from './client'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default function PrivateLayout({
  children,
}: {
  children: ReactNode
  params: Promise<Record<string, never>>
}) {
  return <PrivateLayoutClient>{children}</PrivateLayoutClient>
}
