'use client'

import { Loading } from '@/components/loading'
import { BetterScrollAreaFaded } from '@/components/ui/better-scroll-area'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { SheetClose } from '@/components/ui/sheet'
import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/server/auth/session'
import { getVaultsAction } from '@/server/vault/vault'
import { useAuthStore } from '@/store/use-auth-store'
import {
  Logout02Icon,
  SquareUnlock01Icon,
  UserCircleIcon,
  WalletAdd01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { resolveVaultIcon } from './constants/vault-icons'
import { VaultCreateDialog } from './vault-create-dialog'

export function VaultSidebarDesktop({
  mobileMode,
  triggerSheetClose,
}: {
  mobileMode?: boolean
  triggerSheetClose?: () => void
}) {
  const pathname = usePathname()

  const vaultAuthMap = useAuthStore((state) => state.vaultAuthByVaultId)
  const setVaultAuth = useAuthStore((state) => state.setVaultAuth)

  const vaultsQuery = useQuery({
    queryFn: () => getVaultsAction(),
    queryKey: ['vaults'],
  })

  const [isCreateVaultDialogOpen, setIsCreateVaultDialogOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredVaults =
    vaultsQuery.data?.vaults.filter((vault) =>
      vault.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) || []

  async function handleSignOut() {
    if (isSigningOut) {
      return
    }

    setIsSigningOut(true)

    try {
      await signOutAction()
      window.location.href = '/'
    } finally {
      setIsSigningOut(false)
    }
  }

  const noVaultAvailable = vaultsQuery.data?.vaults.length === 0

  return (
    <aside
      className={cn(
        'border-border bg-card grid h-screen w-[16rem] grid-rows-[auto_1fr_auto] border-r',
        mobileMode && 'w-full'
      )}
    >
      <div className="flex items-center gap-4 border-b p-3 py-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="size-9 rounded-full"
            >
              <UserAvatar className="size-9" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start">
            <DropdownMenuItem asChild>
              <Link href="/account">
                <HugeiconsIcon icon={UserCircleIcon} /> Account
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              variant="destructive"
              disabled={isSigningOut}
              onSelect={(event) => {
                event.preventDefault()
                void handleSignOut()
              }}
            >
              {isSigningOut ? (
                <Loading className="size-4" />
              ) : (
                <HugeiconsIcon icon={Logout02Icon} />
              )}
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Input
          placeholder="Search Vault"
          value={searchQuery}
          disabled={noVaultAvailable}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {mobileMode && (
          <SheetClose asChild>
            <Button size="icon" variant="secondary" className="rounded-xl">
              <svg
                fill="none"
                width="1em"
                height="1em"
                viewBox="0 0 16 16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.7434 1.1709L0.743408 15.1709M0.743408 1.1709L14.7434 15.1709"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all"
                />
              </svg>
            </Button>
          </SheetClose>
        )}
      </div>

      {noVaultAvailable ? (
        <div className="flex h-full items-center justify-center">
          <Button onClick={() => setIsCreateVaultDialogOpen(true)}>
            <HugeiconsIcon icon={WalletAdd01Icon} className="size-4" />
            Create new vault
          </Button>
        </div>
      ) : (
        <BetterScrollAreaFaded fadeSpace="12px">
          <ul className="flex flex-col gap-2 p-3">
            {filteredVaults.map((vault) => {
              const isActive = pathname.startsWith(`/vault/${vault.id}`)

              return (
                <li key={vault.id} className="relative isolate">
                  <Button
                    asChild
                    size="lg"
                    onClick={triggerSheetClose}
                    className="w-full justify-between px-3"
                    variant={isActive ? 'default' : 'ghost'}
                  >
                    <Link href={`/vault/${vault.id}`}>
                      <span className="flex items-center gap-2.5">
                        <HugeiconsIcon
                          icon={resolveVaultIcon(vault.icon || '')}
                          className="text-foreground/80 size-4"
                        />

                        <span className="truncate">{vault.name}</span>
                      </span>
                    </Link>
                  </Button>

                  {!!vaultAuthMap[vault.id] && (
                    <Button
                      variant="ghost"
                      className="absolute top-1/2 right-2 size-6 -translate-y-1/2 p-0"
                      onClick={() => setVaultAuth(vault.id, null)}
                    >
                      <HugeiconsIcon
                        icon={SquareUnlock01Icon}
                        className="text-foreground/50 size-3"
                      />
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>

          {searchQuery && filteredVaults.length === 0 && (
            <p className="text-muted-foreground px-4 text-center text-sm break-keep">
              <span className="break-keep">No vaults found for</span>{' '}
              <span className="break-all">&quot;{searchQuery}&quot;</span>
            </p>
          )}
        </BetterScrollAreaFaded>
      )}

      {!noVaultAvailable && (
        <div className="flex flex-col gap-2 border-t p-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsCreateVaultDialogOpen(true)}
          >
            <HugeiconsIcon icon={WalletAdd01Icon} className="size-4" />
            Create new vault
          </Button>
        </div>
      )}

      <VaultCreateDialog
        open={isCreateVaultDialogOpen}
        onOpenChange={setIsCreateVaultDialogOpen}
      />
    </aside>
  )
}
