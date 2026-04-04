'use client'

import { BetterScrollArea } from '@/components/ui/better-scroll-area'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Wrapper } from '@/components/wrapper'
import {
  Delete02Icon,
  File01Icon,
  FolderEditIcon,
  LogoutSquare02Icon,
  MoreVerticalIcon,
  ShieldKeyIcon,
  TaskAdd02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState } from 'react'
import { CreateRecordDialog } from './components/create-record-dialog'
import { RecordsList } from './components/records-list'
import { resolveVaultIcon } from './constants/vault-icons'
import { useVaultContext } from './contexts/vault-context'

export function VaultAuthedPage() {
  const { vault, records } = useVaultContext()
  const [isCreateRecordDialogOpen, setIsCreateRecordDialogOpen] =
    useState(false)

  return (
    <div className="grid size-full grid-rows-[auto_1fr]">
      <header className="border-border/50 border-b">
        <Wrapper className="flex h-14 flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <HugeiconsIcon
              icon={resolveVaultIcon(vault.icon)}
              className="size-4.5"
            />
            {vault.name}
          </h1>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <HugeiconsIcon icon={MoreVerticalIcon} className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <HugeiconsIcon icon={FolderEditIcon} className="size-4" />
                  Edit Vault
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={LogoutSquare02Icon} className="size-4" />
                  Lock Vault
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <HugeiconsIcon icon={ShieldKeyIcon} className="size-4" />
                  Change Secret
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive">
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  Delete Vault
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={() => setIsCreateRecordDialogOpen(true)}
            >
              <HugeiconsIcon icon={TaskAdd02Icon} className="size-4" />
              Create record
            </Button>
          </div>
        </Wrapper>
      </header>

      <BetterScrollArea>
        <Wrapper className="py-4">
          {records.length === 0 ? (
            <section className="border-border bg-card rounded-[2rem] border p-8 text-center shadow-sm sm:p-12">
              <div className="bg-muted mx-auto flex size-16 items-center justify-center rounded-3xl">
                <HugeiconsIcon icon={File01Icon} className="size-7" />
              </div>
              <div className="mt-6 space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">
                  No records in this vault yet
                </h2>
                <p className="text-muted-foreground mx-auto max-w-md text-sm leading-6">
                  Add the first record now and keep its details in ordered key
                  and value fields.
                </p>
              </div>
            </section>
          ) : (
            <RecordsList records={records} />
          )}
        </Wrapper>
      </BetterScrollArea>

      <CreateRecordDialog
        open={isCreateRecordDialogOpen}
        onOpenChange={setIsCreateRecordDialogOpen}
      />
    </div>
  )
}
