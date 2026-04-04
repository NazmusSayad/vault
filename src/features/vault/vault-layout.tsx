import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { VaultSidebarDesktop } from './components/vault-sidebar-desktop'
import { VaultSidebarMobile } from './components/vault-sidebar-mobile'
import styles from './vault-layout.module.css'

export function VaultLayout({ children }: PropsWithChildren) {
  const isMobile = useMediaQuery('(max-width: 45rem)')

  return (
    <main
      className={cn(
        styles.vaultMain,
        'grid grid-cols-[auto_1fr]',
        isMobile && 'grid-cols-1 grid-rows-[1fr_auto]'
      )}
    >
      {!isMobile && <VaultSidebarDesktop />}

      {children}

      {isMobile && <VaultSidebarMobile />}
    </main>
  )
}
