'use client'

import { LoadingSection } from '@/components/loading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { BetterScrollAreaFaded } from '@/components/ui/better-scroll-area'
import { Button } from '@/components/ui/button'
import { getVaultsAction } from '@/server/vault/vault'
import { Folder01Icon, WalletAdd01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useState } from 'react'
import { VaultCreateDialog } from './vault-create-dialog'

export function VaultHomePage() {
  const vaultsQuery = useQuery({
    queryFn: () => getVaultsAction(),
    queryKey: ['vaults'],
  })

  const [isCreateVaultDialogOpen, setIsCreateVaultDialogOpen] = useState(false)

  return (
    <BetterScrollAreaFaded>
      <div className="bg-background text-foreground min-h-screen px-6 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
          <section className="from-card via-card to-muted/40 border-border grid gap-6 overflow-hidden rounded-[2rem] border bg-gradient-to-br p-6 shadow-sm sm:p-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-end">
            <div className="space-y-4">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                Vault workspace
              </Badge>
              <div className="space-y-3">
                <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  Keep every vault organized and ready for its next record.
                </h1>
                <p className="text-muted-foreground max-w-2xl text-sm leading-6 sm:text-base">
                  Create a vault, group related records together, and jump
                  straight into the details whenever you need to update
                  something.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:items-start lg:items-end">
              <Button
                className="w-full sm:w-auto"
                onClick={() => setIsCreateVaultDialogOpen(true)}
              >
                <HugeiconsIcon icon={WalletAdd01Icon} className="size-4" />
                New vault
              </Button>

              <p className="text-muted-foreground text-sm">
                {vaultsQuery.data?.vaults.length ?? 0} vaults available
              </p>
            </div>
          </section>

          {vaultsQuery.isPending && <LoadingSection />}

          {vaultsQuery.isError && (
            <Alert variant="destructive">
              <AlertTitle>Could not load vaults</AlertTitle>
              <AlertDescription>
                {vaultsQuery.error instanceof Error
                  ? vaultsQuery.error.message
                  : 'Try again in a moment.'}
              </AlertDescription>
            </Alert>
          )}

          {vaultsQuery.data && vaultsQuery.data.vaults.length === 0 && (
            <section className="border-border bg-card rounded-[2rem] border p-8 text-center shadow-sm sm:p-12">
              <div className="bg-muted mx-auto flex size-16 items-center justify-center rounded-3xl">
                <HugeiconsIcon icon={Folder01Icon} className="size-7" />
              </div>
              <div className="mt-6 space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  No vaults yet
                </h2>
                <p className="text-muted-foreground mx-auto max-w-md text-sm leading-6">
                  Start with your first vault, then add records for passwords,
                  API keys, notes, or any other key-value data you want to keep
                  close.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <Button onClick={() => setIsCreateVaultDialogOpen(true)}>
                  <HugeiconsIcon icon={WalletAdd01Icon} className="size-4" />
                  Create your first vault
                </Button>
              </div>
            </section>
          )}

          {vaultsQuery.data && vaultsQuery.data.vaults.length > 0 && (
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {vaultsQuery.data.vaults.map((vault) => (
                <Link
                  key={vault.id}
                  href={`/vault/${vault.id}`}
                  className="border-border bg-card hover:border-primary/40 hover:bg-card/80 rounded-[1.5rem] border p-5 shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="bg-muted text-foreground flex size-12 items-center justify-center rounded-2xl text-lg font-semibold">
                      {vault.icon?.trim() || vault.name.charAt(0).toUpperCase()}
                    </div>
                  </div>

                  <div className="mt-5 space-y-2">
                    <h2 className="text-lg font-semibold tracking-tight">
                      {vault.name}
                    </h2>
                    <p className="text-muted-foreground text-sm">
                      Updated {new Date(vault.updatedAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="text-primary mt-6 text-sm font-medium">
                    Open vault
                  </div>
                </Link>
              ))}
            </section>
          )}
        </div>
      </div>

      <VaultCreateDialog
        open={isCreateVaultDialogOpen}
        onOpenChange={setIsCreateVaultDialogOpen}
      />
    </BetterScrollAreaFaded>
  )
}
