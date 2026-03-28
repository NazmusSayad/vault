'use server'

import { getSession, signOut } from '@/server/auth/session'

export async function getSessionAction() {
  return getSession()
}

export async function signOutAction() {
  return signOut()
}
