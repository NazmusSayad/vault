'use client'

import dynamic from 'next/dynamic'

const VaultLayout = dynamic(
  () => import('@/features/vault/vault-layout').then((mod) => mod.VaultLayout),
  {
    ssr: false,
  }
)

export default VaultLayout
