import {
  BetterScrollAreaContent,
  BetterScrollAreaProvider,
} from '@/components/ui/better-scroll-area'
import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { VaultSidebarDesktop } from './vault-sidebar-desktop'
import { VaultSidebarMobile } from './vault-sidebar-mobile'

export function VaultLayout({ children }: PropsWithChildren) {
  const isMobile = useMediaQuery('(max-width: 45rem)')

  return (
    <main
      className={cn(
        'grid min-h-screen grid-cols-[auto_1fr]',
        isMobile && 'grid-cols-1 grid-rows-[1fr_auto]'
      )}
    >
      {!isMobile && <VaultSidebarDesktop />}

      <BetterScrollAreaProvider>
        <BetterScrollAreaContent
          style={{
            maskImage: `linear-gradient(to bottom, transparent 0, black 16px, black calc(100% - 16px), transparent 100%)`,
          }}
        >
          {children}
        </BetterScrollAreaContent>
      </BetterScrollAreaProvider>

      {isMobile && <VaultSidebarMobile />}
    </main>
  )
}
