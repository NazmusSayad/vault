'use client'

import { useParams } from 'next/navigation'
import { VaultContextProvider } from './contexts/vault-context'
import { VaultAuthedPage } from './vault-authed-page'

export function VaultRecordsPage() {
  const vaultId = useParams().vault as string

  return (
    <VaultContextProvider id={vaultId}>
      <VaultAuthedPage />
    </VaultContextProvider>
  )
}
