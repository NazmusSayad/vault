'use client'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { getVaultsAction } from '@/server/vault/vault'
import { Menu01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { VaultSidebarDesktop } from './vault-sidebar-desktop'

export function VaultSidebarMobile() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const vaultsQuery = useQuery({
    queryFn: () => getVaultsAction(),
    queryKey: ['vaults'],
  })
  const activeVault = vaultsQuery.data?.vaults.find((vault) =>
    pathname.startsWith(`/vault/${vault.id}`)
  )

  return (
    <header className="border-border bg-background/90 sticky top-0 z-20 border-t backdrop-blur">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs tracking-[0.24em] uppercase">
            Vault
          </p>
          <h2 className="truncate text-base font-semibold tracking-tight">
            {activeVault?.name || 'All vaults'}
          </h2>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline">
              <HugeiconsIcon icon={Menu01Icon} className="size-4" />
              <span className="sr-only">Open vault navigation</span>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            hideCloseButton
            className="w-full max-w-sm gap-0 p-0"
          >
            <SheetTitle hidden>Mobile Navigation</SheetTitle>
            <SheetDescription hidden>
              Browse your vaults and items
            </SheetDescription>

            <VaultSidebarDesktop
              mobileMode
              triggerSheetClose={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
