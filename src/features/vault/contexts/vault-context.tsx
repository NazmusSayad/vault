'use client'

import { LoadingSection } from '@/components/loading'
import { getVaultRecordsAction } from '@/server/vault/vault-record'
import { useAuthStore } from '@/store/use-auth-store'
import { nonNullable } from '@/utils/basic'
import { useQuery } from '@tanstack/react-query'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
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

    const tags = useMemo(() => {
      if (!vaultQuery.data?.records) return []

      const uniqueTags = new Set<string>()
      vaultQuery.data.records.forEach((record) => {
        record.tags.forEach((tag) => uniqueTags.add(tag))
      })

      return arrayNonNullable(Array.from(uniqueTags))
    }, [vaultQuery.data?.records])

    return {
      id,

      secret: vaultSecret,
      setSecret: (auth: string) => setVaultSecret(id, auth),

      isLoading: vaultQuery.isLoading && !vaultQuery.data,

      vault: nonNullable(vaultQuery.data?.vault),
      records: nonNullable(vaultQuery.data?.records),
      tags,
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
