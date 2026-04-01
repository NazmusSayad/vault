'use client'

import { LoadingSection } from '@/components/loading'
import { getVaultRecordsAction } from '@/server/vault/vault'
import { useAuthStore } from '@/store/use-auth-store'
import { nonNullable } from '@/utils/basic'
import { useQuery } from '@tanstack/react-query'
import { createContext } from 'daily-code/react'
import { VaultUnauthedPage } from '../vault-unauthed-page'

type VaultContextInput = {
  id: string
}

export const [VaultContextProvider, useVaultContext] = createContext(
  ({ id }: VaultContextInput) => {
    const vaultSecret = useAuthStore((state) => state.vaultAuthByVaultId[id])
    const setVaultSecret = useAuthStore((state) => state.setVaultAuth)

    const vaultQuery = useQuery({
      queryKey: ['vault', id],
      queryFn: async () => {
        return getVaultRecordsAction({
          vaultId: id,
          auth: vaultSecret,
        })
      },

      enabled: !!vaultSecret,
    })

    return {
      id,

      secret: vaultSecret,
      setSecret: (auth: string) => setVaultSecret(id, auth),

      isLoading: vaultQuery.isLoading && !vaultQuery.data,
      vault: nonNullable(vaultQuery.data?.vault),
      records: nonNullable(vaultQuery.data?.records),
    }
  },

  {
    useChildrenProvider(children, value) {
      if (!value.secret) return <VaultUnauthedPage />

      if (value.isLoading) {
        return <LoadingSection />
      }

      if (value.vault && value.records) {
        return children
      }

      return <div>Failed to load vault data.</div>
    },
  }
)
