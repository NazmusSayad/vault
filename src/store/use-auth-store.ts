'use client'

import { SessionUserType } from '@/lib/schema'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export const useAuthStore = create(
  combine(
    {
      status: 'loading' as 'authenticated' | 'loading' | 'unauthenticated',
      user: null as SessionUserType | null,
      vaultAuthByVaultId: {} as Record<string, string>,
    },
    (set) => ({
      clearSession() {
        set({
          status: 'unauthenticated',
          user: null,
          vaultAuthByVaultId: {},
        })
      },

      clearVaultAuth(vaultId: string) {
        set((state) => {
          const vaultAuthByVaultId = { ...state.vaultAuthByVaultId }

          delete vaultAuthByVaultId[vaultId]

          return {
            vaultAuthByVaultId,
          }
        })
      },

      setSession(user: SessionUserType | null) {
        set({
          status: user ? 'authenticated' : 'unauthenticated',
          user,
        })
      },

      setVaultAuth(vaultId: string, auth: string | null) {
        set((state) => ({
          vaultAuthByVaultId: {
            ...state.vaultAuthByVaultId,
            [vaultId]: auth ?? '',
          },
        }))
      },
    })
  )
)
/**
 * This guarantees that the user is authenticated and returns the user object.
 * Returns the authenticated user from the auth store. If the user is not authenticated, it throws an error.
 * This should be used when you are sure that the user is authenticated.
 */
export function useAuthenticatedUser() {
  const user = useAuthStore((state) => state.user)
  if (!user) {
    throw new Error('User is not authenticated')
  }

  return user
}
