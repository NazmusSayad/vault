'use client'

import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

const VaultLayout = dynamic(
  () => import('@/features/vault/vault-layout').then((mod) => mod.VaultLayout),
  { ssr: false }
)

export default function Layout({
  children,
}: {
  children: ReactNode
  params: Promise<Record<string, never>>
}) {
  return <VaultLayout>{children}</VaultLayout>
}
