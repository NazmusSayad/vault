'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
} from '@/features/record/view-record-dialog'
import { RecordType } from '@/server/.db/browser'
import { getVaultAction, unlockVaultAction } from '@/server/vault/vault'
import { useAuthStore } from '@/store/use-auth-store'
import {
  File01Icon,
  Key02Icon,
  NoteIcon,
  SquareLock02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useParams, usePathname, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'

function getRecordTypeIcon(type: RecordType) {
  if (type === RecordType.PASSWORD) {
    return SquareLock02Icon
  }

  if (type === RecordType.API_KEY) {
    return Key02Icon
  }

  return NoteIcon
}

type VaultUnlockDialogProps = {
  open: boolean
  vaultId: string
  onOpenChange: (open: boolean) => void
}

function VaultUnlockDialog({
  open,
  vaultId,
  onOpenChange,
}: VaultUnlockDialogProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const setVaultAuth = useAuthStore((state) => state.setVaultAuth)
  const [auth, setAuth] = useState('')
  const [error, setError] = useState('')
  const unlockVaultMutation = useMutation({
    mutationFn: unlockVaultAction,
    onSuccess: (_, variables) => {
      setError('')
      setVaultAuth(vaultId, variables.auth)
      onOpenChange(false)
    },
  })

  return (
    <BetterDialog open={open} onOpenChange={onOpenChange} width="32rem">
      <BetterDialogContent
        _headerContent={
          <div className="border-border flex min-h-17 flex-col justify-center gap-0.5 border-b px-4.5 pb-0.5">
            <h2 className="text-base font-medium">Unlock vault</h2>
            <p className="text-muted-foreground/75 text-sm text-[0.8125rem]">
              Enter the vault PIN to access this vault.
            </p>
          </div>
        }
        footerSubmit="Unlock vault"
        footerSubmitIcon={
          <HugeiconsIcon icon={SquareLock02Icon} className="size-4" />
        }
        footerSubmitLoading={unlockVaultMutation.isPending}
        onFooterSubmitClick={() => formRef.current?.requestSubmit()}
      >
        <form
          ref={formRef}
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault()

            unlockVaultMutation.mutate(
              {
                auth,
                vaultId,
              },
              {
                onError: (mutationError) => {
                  setError(
                    mutationError instanceof Error
                      ? mutationError.message
                      : 'Could not unlock this vault.'
                  )
                },
              }
            )
          }}
        >
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="vault-auth">
              Vault PIN
            </label>
            <Input
              id="vault-auth"
              type="password"
              placeholder="Enter a vault PIN"
              value={auth}
              onChange={(event) => {
                setError('')
                setAuth(event.target.value)
              }}
            />
          </div>

          {error && (
            <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
              {error}
            </div>
          )}
        </form>
      </BetterDialogContent>
    </BetterDialog>
  )
}

export function VaultRecordsPage() {
  const params = useParams<{ vault: string }>()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const vaultId = params.vault
  const vaultAuth = useAuthStore(
    (state) => state.vaultAuthByVaultId[vaultId] ?? null
  )
  const [unlockOpen, setUnlockOpen] = useState(false)
  const vaultQuery = useQuery({
    queryFn: () => getVaultAction({ vaultId }),
    queryKey: ['vault', vaultId],
  })

  if (vaultQuery.isPending) {
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

  if (vaultQuery.isError) {
    return (
      <main className="bg-background text-foreground min-h-screen px-6 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto w-full max-w-3xl">
          <Alert variant="destructive">
            <AlertTitle>Could not load this vault</AlertTitle>
            <AlertDescription>
              {vaultQuery.error instanceof Error
                ? vaultQuery.error.message
                : 'Try again in a moment.'}
            </AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  const vault = vaultQuery.data.vault
  const records = vaultQuery.data.records
  const shouldOpenUnlock = !vaultAuth || unlockOpen

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

            {vaultAuth ? (
              <RecordCreateDialog
                vaultId={vaultId}
                trigger={
                  <Button className="w-full sm:w-auto">
                    <HugeiconsIcon icon={File01Icon} className="size-4" />
                    New record
                  </Button>
                }
              />
            ) : (
              <Button
                className="w-full sm:w-auto"
                onClick={() => setUnlockOpen(true)}
              >
                <HugeiconsIcon icon={SquareLock02Icon} className="size-4" />
                Unlock vault
              </Button>
            )}
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
              {vaultAuth ? (
                <RecordCreateDialog
                  vaultId={vaultId}
                  trigger={
                    <Button>
                      <HugeiconsIcon icon={File01Icon} className="size-4" />
                      Create record
                    </Button>
                  }
                />
              ) : (
                <Button onClick={() => setUnlockOpen(true)}>
                  <HugeiconsIcon icon={SquareLock02Icon} className="size-4" />
                  Unlock vault
                </Button>
              )}
            </div>
          </section>
        ) : (
          <section className="border-border bg-card overflow-hidden rounded-[2rem] border shadow-sm">
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
                  <TableRow key={record.id}>
                    <TableCell className="py-4">
                      {vaultAuth ? (
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
                      ) : (
                        <button
                          type="button"
                          className="hover:text-primary flex items-center gap-3 font-medium transition-colors"
                          onClick={() => setUnlockOpen(true)}
                        >
                          <span className="bg-muted flex size-9 items-center justify-center rounded-xl">
                            <HugeiconsIcon
                              icon={getRecordTypeIcon(record.type)}
                              className="size-4"
                            />
                          </span>
                          <span>{record.name}</span>
                        </button>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.type}</Badge>
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

        {vaultAuth && <RecordDialog vaultId={vaultId} />}

        <VaultUnlockDialog
          open={shouldOpenUnlock}
          vaultId={vaultId}
          onOpenChange={setUnlockOpen}
        />
      </div>
    </main>
  )
}
