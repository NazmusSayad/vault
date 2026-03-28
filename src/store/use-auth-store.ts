'use client'

import type { SessionUser } from '@/server/auth/types'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export const useAuthStore = create(
  combine(
    {
      status: 'loading' as 'authenticated' | 'loading' | 'unauthenticated',
      user: null as SessionUser | null,
    },
    (set) => ({
      clearSession() {
        set({ status: 'unauthenticated', user: null })
      },

      setSession(user: SessionUser | null) {
        set({
          status: user ? 'authenticated' : 'unauthenticated',
          user,
        })
      },
    })
  )
)
/**
 * @throws {Error} If the user is not authenticated, an error is thrown.
 * @return {SessionUser} The authenticated user.
 *
 * This should be used when you are sure that the user is authenticated.
 */
export function useAuthenticatedUser() {
  const user = useAuthStore((state) => state.user)
  if (!user) {
    throw new Error('User is not authenticated')
  }

  return user
}
