import {
  AnonymousIcon,
  CirclePasswordIcon,
  EncryptIcon,
  FingerPrintIcon,
  FolderLockedIcon,
  IncognitoIcon,
  Key01Icon,
  LockedIcon,
  LockIcon,
  LockKeyIcon,
  LockPasswordIcon,
  SafeBoxIcon,
  SecurityLockIcon,
  SecurityPasswordIcon,
  ShieldKeyIcon,
  ViewOffIcon,
} from '@hugeicons/core-free-icons'
import { IconSvgElement } from '@hugeicons/react'

export const VAULT_ICONS: Record<string, IconSvgElement> = {
  password: LockPasswordIcon,
  anonymous: AnonymousIcon,
  lock: LockIcon,
  locked: LockedIcon,
  key: Key01Icon,
  lockKey: LockKeyIcon,
  securityLock: SecurityLockIcon,
  securityPassword: SecurityPasswordIcon,
  shieldKey: ShieldKeyIcon,
  encrypt: EncryptIcon,
  fingerprint: FingerPrintIcon,
  incognito: IncognitoIcon,
  hidden: ViewOffIcon,
  safe: SafeBoxIcon,
  pin: CirclePasswordIcon,
}

export function resolveVaultIcon(name: string): IconSvgElement {
  return VAULT_ICONS[name] || FolderLockedIcon
}
