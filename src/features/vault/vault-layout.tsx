import { PropsWithChildren } from 'react'
import { VaultSidebarDesktop } from './vault-sidebar-desktop'

export function VaultLayout({ children }: PropsWithChildren) {
  return (
    <main className="grid min-h-full grid-cols-[auto_1fr]">
      <VaultSidebarDesktop />

      <div>{children}</div>
    </main>
  )
}
