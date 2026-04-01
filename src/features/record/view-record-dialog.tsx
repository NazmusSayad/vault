'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EncryptionClient } from '@/lib/encryption/encryption.client'
import { queryClient } from '@/lib/query-client'
import { RecordType } from '@/server/db/.prisma/browser'
import {
  getVaultRecordAction,
  updateVaultRecordAction,
} from '@/server/vault/vault-record'
import { useAuthStore } from '@/store/use-auth-store'
import {
  Key02Icon,
  NoteIcon,
  SquareLock02Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { RecordEditor, type RecordField } from './record-editor'

const encryption = new EncryptionClient()

function getRecordTypeIcon(type: RecordType) {
  if (type === RecordType.PASSWORD) {
    return SquareLock02Icon
  }

  if (type === RecordType.API_KEY) {
    return Key02Icon
  }

  return NoteIcon
}

function getRecordDialogHref(
  pathname: string,
  searchParams: { toString(): string },
  recordId?: string
) {
  const nextSearchParams = new URLSearchParams(searchParams.toString())

  if (recordId) {
    nextSearchParams.set('record', recordId)
  } else {
    nextSearchParams.delete('record')
  }

  const query = nextSearchParams.toString()

  return query ? `${pathname}?${query}` : pathname
}

type RecordDialogProps = {
  vaultId: string
}

type RecordDialogContentProps = {
  recordId: string
  vaultId: string
}

type DecryptedRecord = {
  id: string
  createdAt: string
  updatedAt: string
  name: string
  type: RecordType
  data: RecordField[]
  vaultId: string
}

type EditableRecordProps = {
  record: DecryptedRecord
  vault: Awaited<ReturnType<typeof getVaultRecordAction>>['vault']
}

function isRecordField(value: unknown): value is RecordField {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === 'string' &&
    typeof value[1] === 'string'
  )
}

function isRecordData(value: unknown): value is RecordField[] {
  return Array.isArray(value) && value.every(isRecordField)
}

function parseRecordData(value: string) {
  const parsed = JSON.parse(value)

  if (!isRecordData(parsed)) {
    throw new Error('Invalid record data.')
  }

  return parsed
}

export function RecordDialog({ vaultId }: RecordDialogProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordId = searchParams.get('record')?.trim() ?? ''

  return (
    <BetterDialog
      open={Boolean(recordId)}
      onOpenChange={(open) => {
        if (!open) {
          router.replace(getRecordDialogHref(pathname, searchParams))
        }
      }}
      width="56rem"
    >
      {recordId && (
        <RecordDialogContent
          key={recordId}
          recordId={recordId}
          vaultId={vaultId}
        />
      )}
    </BetterDialog>
  )
}

function RecordDialogContent({ recordId, vaultId }: RecordDialogContentProps) {
  const auth = useAuthStore(
    (state) => state.vaultAuthByVaultId[vaultId] ?? null
  )
  const recordQuery = useQuery({
    enabled: Boolean(auth),
    queryFn: async () => {
      const result = await getVaultRecordAction({
        auth: auth!,
        recordId,
        vaultId,
      })

      return {
        record: {
          ...result.record,
          data: parseRecordData(
            await encryption.decrypt({
              key: auth!,
              data: result.record.data,
            })
          ),
        },
        vault: result.vault,
      }
    },
    queryKey: ['vault-record', vaultId, recordId, auth],
  })

  if (recordQuery.isPending) {
    return (
      <BetterDialogContent
        title="Loading record"
        description="Fetching record details."
      >
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      </BetterDialogContent>
    )
  }

  if (recordQuery.isError) {
    return (
      <BetterDialogContent
        title="Could not load record"
        description="This record could not be opened."
        footerCancel
      >
        <Alert variant="destructive">
          <AlertTitle>Record unavailable</AlertTitle>
          <AlertDescription>
            {recordQuery.error instanceof Error
              ? recordQuery.error.message
              : 'Try again in a moment.'}
          </AlertDescription>
        </Alert>
      </BetterDialogContent>
    )
  }

  return (
    <EditableRecord
      key={recordQuery.data.record.updatedAt}
      record={recordQuery.data.record}
      vault={recordQuery.data.vault}
    />
  )
}

function EditableRecord({ record, vault }: EditableRecordProps) {
  const auth = useAuthStore(
    (state) => state.vaultAuthByVaultId[vault.id] ?? null
  )
  const formRef = useRef<HTMLFormElement>(null)
  const [data, setData] = useState<RecordField[]>(record.data)
  const [error, setError] = useState('')
  const [name, setName] = useState(record.name)
  const [type, setType] = useState<RecordType>(record.type)
  const updateRecordMutation = useMutation({
    mutationFn: async (input: {
      data: RecordField[]
      name: string
      type: RecordType
    }) => {
      if (!auth) {
        throw new Error('Unlock this vault first.')
      }

      return updateVaultRecordAction({
        auth,
        data: await encryption.encrypt({
          key: auth,
          data: JSON.stringify(input.data),
        }),
        name: input.name,
        recordId: record.id,
        type: input.type,
        vaultId: vault.id,
      })
    },
    onSuccess: async () => {
      setError('')

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vault', vault.id] }),
        queryClient.invalidateQueries({ queryKey: ['vault-record', vault.id] }),
        queryClient.invalidateQueries({ queryKey: ['vaults'] }),
      ])

      toast.success('Record updated.')
    },
  })

  return (
    <BetterDialogContent
      title={name}
      description={`Updated ${new Date(record.updatedAt).toLocaleString()}`}
      className="space-y-1"
      footerCancel
      footerSubmit="Save changes"
      footerSubmitLoading={updateRecordMutation.isPending}
      onFooterSubmitClick={() => formRef.current?.requestSubmit()}
    >
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <span className="bg-muted flex size-12 items-center justify-center rounded-2xl">
            <HugeiconsIcon icon={getRecordTypeIcon(type)} className="size-5" />
          </span>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {type}
            </Badge>
            <span className="text-muted-foreground text-sm">{vault.name}</span>
          </div>
        </div>

        <RecordEditor
          formRef={formRef}
          name={name}
          type={type}
          data={data}
          error={error}
          isPending={updateRecordMutation.isPending}
          hideSubmit
          submitLabel="Save changes"
          onNameChange={setName}
          onTypeChange={setType}
          onDataChange={setData}
          onSubmit={(event) => {
            event.preventDefault()

            updateRecordMutation.mutate(
              {
                data,
                name,
                type,
              },
              {
                onError: (mutationError) => {
                  setError(
                    mutationError instanceof Error
                      ? mutationError.message
                      : 'Could not update the record.'
                  )
                },
              }
            )
          }}
        />
      </div>
    </BetterDialogContent>
  )
}

export { getRecordDialogHref }
