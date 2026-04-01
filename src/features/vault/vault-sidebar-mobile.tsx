'use client'

import { Loading } from '@/components/loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getVaultsAction } from '@/server/vault/vault'
import {
  Folder01Icon,
  Home03Icon,
  Menu01Icon,
  WalletAdd01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { VaultCreateDialog } from './vault-create-dialog'

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
    <header className="border-border bg-background/90 sticky top-0 z-20 border-b backdrop-blur">
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

          <SheetContent side="right" className="w-full max-w-sm p-0">
            <SheetHeader className="border-border border-b">
              <SheetTitle>Vaults</SheetTitle>
              <SheetDescription>
                Open a vault or create a new one.
              </SheetDescription>
            </SheetHeader>

            <div className="flex h-full flex-col">
              <div className="px-4 pt-4">
                <VaultCreateDialog
                  trigger={
                    <Button className="w-full">
                      <HugeiconsIcon
                        icon={WalletAdd01Icon}
                        className="size-4"
                      />
                      New vault
                    </Button>
                  }
                />
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4">
                <nav className="space-y-2">
                  <Link
                    href="/vault"
                    className={cn(
                      'hover:bg-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors',
                      pathname === '/vault' &&
                        'bg-muted text-foreground font-medium'
                    )}
                    onClick={() => setOpen(false)}
                  >
                    <span className="bg-background flex size-9 items-center justify-center rounded-xl border">
                      <HugeiconsIcon icon={Home03Icon} className="size-4" />
                    </span>
                    <span className="flex-1">All vaults</span>
                  </Link>

                  {vaultsQuery.isPending && (
                    <div className="flex justify-center py-8">
                      <Loading className="text-primary size-10 shrink-0" />
                    </div>
                  )}

                  {vaultsQuery.data?.vaults.map((vault) => {
                    const isActive = pathname.startsWith(`/vault/${vault.id}`)

                    return (
                      <Link
                        key={vault.id}
                        href={`/vault/${vault.id}`}
                        className={cn(
                          'hover:bg-muted flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors',
                          isActive && 'bg-muted text-foreground font-medium'
                        )}
                        onClick={() => setOpen(false)}
                      >
                        <span className="bg-background flex size-9 items-center justify-center rounded-xl border text-sm font-semibold">
                          {vault.icon?.trim() ||
                            vault.name.charAt(0).toUpperCase()}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate">{vault.name}</span>
                          <span className="text-muted-foreground truncate text-xs">
                            Updated{' '}
                            {new Date(vault.updatedAt).toLocaleDateString()}
                          </span>
                        </span>
                        <Badge variant="outline">{vault.recordCount}</Badge>
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="border-border bg-card border-t px-4 py-4 text-sm">
                <div className="text-muted-foreground flex items-center gap-3">
                  <HugeiconsIcon icon={Folder01Icon} className="size-4" />
                  <span>
                    {vaultsQuery.data?.vaults.length ?? 0} vaults in workspace
                  </span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
