'use client'

import { BetterScrollArea } from '@/components/ui/better-scroll-area'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Wrapper } from '@/components/wrapper'
import {
  Delete02Icon,
  File01Icon,
  Key01Icon,
  LockIcon,
  MoreVerticalIcon,
  NoteIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { RecordCreateDialog } from './components/record-create-dialog'
import { RecordRow } from './components/record-row'
import { resolveVaultIcon } from './constants/vault-icons'
import { useVaultContext } from './contexts/vault-context'

export function VaultAuthedPage() {
  const { vault, records } = useVaultContext()

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

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <HugeiconsIcon icon={MoreVerticalIcon} className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <HugeiconsIcon icon={NoteIcon} className="size-4" />
                Edit Vault
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={LockIcon} className="size-4" />
                Lock Vault
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HugeiconsIcon icon={Key01Icon} className="size-4" />
                Change Secret
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive">
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                Delete Vault
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </Wrapper>
      </header>

      <BetterScrollArea>
        <Wrapper>
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
              <div className="mt-6 flex justify-center">
                <RecordCreateDialog
                  vaultId={vault.id}
                  trigger={
                    <Button>
                      <HugeiconsIcon icon={File01Icon} className="size-4" />
                      Create record
                    </Button>
                  }
                />
              </div>
            </section>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <RecordRow key={record.id} record={record} />
                ))}
              </TableBody>
            </Table>
          )}
        </Wrapper>
      </BetterScrollArea>
    </div>
  )
}
