'use client'

import { Loading } from '@/components/loading'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getVaultsAction } from '@/server/vault/vault'
import {
  Folder01Icon,
  Home03Icon,
  WalletAdd01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { VaultCreateDialog } from './vault-create-dialog'

export function VaultSidebarDesktop() {
  const pathname = usePathname()
  const vaultsQuery = useQuery({
    queryFn: () => getVaultsAction(),
    queryKey: ['vaults'],
  })

  return (
    <aside className="border-border bg-card/70 h-screen w-[20rem] min-w-[20rem] border-r">
      <div className="flex h-full flex-col">
        <div className="border-border flex items-center justify-between border-b px-5 py-5">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs tracking-[0.24em] uppercase">
              Workspace
            </p>
            <h2 className="text-lg font-semibold tracking-tight">Vaults</h2>
          </div>

          <VaultCreateDialog
            trigger={
              <Button size="icon" variant="outline">
                <HugeiconsIcon icon={WalletAdd01Icon} className="size-4" />
                <span className="sr-only">Create vault</span>
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
                pathname === '/vault' && 'bg-muted text-foreground font-medium'
              )}
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
                >
                  <span className="bg-background flex size-9 items-center justify-center rounded-xl border text-sm font-semibold">
                    {vault.icon?.trim() || vault.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate">{vault.name}</span>
                    <span className="text-muted-foreground truncate text-xs">
                      Updated {new Date(vault.updatedAt).toLocaleDateString()}
                    </span>
                  </span>
                  <Badge variant="outline">{vault.recordCount}</Badge>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="border-border bg-card border-t px-5 py-4">
          <div className="text-muted-foreground flex items-center gap-3 text-sm">
            <HugeiconsIcon icon={Folder01Icon} className="size-4" />
            <span>
              {vaultsQuery.data?.vaults.length ?? 0} vaults in workspace
            </span>
          </div>
        </div>
      </div>
    </aside>
  )
}
