export type PendingAuthState = {
  mode: 'email-verification'
  email: string
  name?: string
  pendingAuthenticationToken: string
}

export type AuthFeedback = {
  error?: string
  notice?: string
  pendingEmail?: string
}

export type SessionUser = {
  id: string
  name: string
  userVerified: boolean
}
