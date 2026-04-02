export function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function getDefaultNameFromEmail(email: string) {
  const value = normalizeEmail(email).split('@')[0]?.trim() ?? ''

  if (!value) {
    return 'Member'
  }

  return value
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`)
    .join(' ')
}
