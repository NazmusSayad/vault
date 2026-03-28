'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RecordCreateDialog } from '@/features/record/record-create-dialog'
import {
  getRecordDialogHref,
  RecordDialog,
} from '@/features/record/record-page'
import { RecordType } from '@/server/.db/browser'
import { getVaultAction } from '@/server/vault/vault'
import { getVaultRecordsAction } from '@/server/vault/vault-record'
import {
  File01Icon,
  Key02Icon,
  NoteIcon,
  SquareLock02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'

function getRecordTypeIcon(type: RecordType) {
  if (type === RecordType.PASSWORD) {
    return SquareLock02Icon
  }

  if (type === RecordType.API_KEY) {
    return Key02Icon
  }

  return NoteIcon
}

export function VaultRecordsPage() {
  const params = useParams<{ vault: string }>()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const vaultId = params.vault
  const vaultQuery = useQuery({
    queryFn: () => getVaultAction({ vaultId }),
    queryKey: ['vault', vaultId],
  })
  const recordsQuery = useQuery({
    queryFn: () => getVaultRecordsAction({ vaultId }),
    queryKey: ['vault-records', vaultId],
  })

  if (vaultQuery.isPending || recordsQuery.isPending) {
    return (
      <main className="bg-background text-foreground min-h-screen px-6 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
          <div className="border-border bg-card rounded-[2rem] border p-6">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-4 h-10 w-72" />
            <Skeleton className="mt-3 h-4 w-56" />
          </div>
          <div className="border-border bg-card rounded-[2rem] border p-6">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="mt-3 h-12 w-full" />
            <Skeleton className="mt-3 h-12 w-full" />
          </div>
        </div>
      </main>
    )
  }

  if (vaultQuery.isError || recordsQuery.isError) {
    const error = vaultQuery.error ?? recordsQuery.error

    return (
      <main className="bg-background text-foreground min-h-screen px-6 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <Alert variant="destructive">
            <AlertTitle>Could not load this vault</AlertTitle>
            <AlertDescription>
              {error instanceof Error
                ? error.message
                : 'Try again in a moment.'}
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const vault = vaultQuery.data.vault
  const records = recordsQuery.data.records

  return (
    <main className="bg-background text-foreground min-h-screen px-6 py-8 sm:px-8 sm:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <section className="from-card via-card to-muted/40 border-border overflow-hidden rounded-[2rem] border bg-gradient-to-br p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-muted flex size-12 items-center justify-center rounded-2xl text-lg font-semibold">
                  {vault.icon?.trim() || vault.name.charAt(0).toUpperCase()}
                </div>
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {vault.recordCount} records
                </Badge>
              </div>
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">Vault overview</p>
                <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  {vault.name}
                </h1>
                <p className="text-muted-foreground max-w-2xl text-sm leading-6">
                  Review every record in this vault and create a new one when
                  you need to add fresh credentials, notes, or keys.
                </p>
              </div>
            </div>

            <RecordCreateDialog
              vaultId={vaultId}
              trigger={
                <Button className="w-full sm:w-auto">
                  <HugeiconsIcon icon={File01Icon} className="size-4" />
                  New record
                </Button>
              }
            />
          </div>
        </section>

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
                Add the first record now and keep its details in ordered key and
                value fields.
              </p>
            </div>
            <div className="mt-6 flex justify-center">
              <RecordCreateDialog
                vaultId={vaultId}
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
          <section className="border-border bg-card overflow-hidden rounded-[2rem] border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Fields</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="py-4">
                      <Link
                        href={getRecordDialogHref(
                          pathname,
                          searchParams,
                          record.id
                        )}
                        className="hover:text-primary flex items-center gap-3 font-medium transition-colors"
                      >
                        <span className="bg-muted flex size-9 items-center justify-center rounded-xl">
                          <HugeiconsIcon
                            icon={getRecordTypeIcon(record.type)}
                            className="size-4"
                          />
                        </span>
                        <span>{record.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.type}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {record.data.length} fields
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(record.updatedAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </section>
        )}

        <RecordDialog vaultId={vaultId} />
      </div>
    </main>
  )
}
