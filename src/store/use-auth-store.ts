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
