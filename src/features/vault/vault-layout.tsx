import { PropsWithChildren } from 'react'
import { VaultSidebar } from './vault-sidebar'

export function VaultLayout({ children }: PropsWithChildren) {
  return (
    <main className="grid min-h-full grid-cols-[auto_1fr]">
      <VaultSidebar />

      <div>{children}</div>
    </main>
  )
}
