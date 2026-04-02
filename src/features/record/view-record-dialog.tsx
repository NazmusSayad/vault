'use client'

import { Loading } from '@/components/loading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { queryClient } from '@/lib/query-client'
import {
  decryptRecordClient,
  encryptRecordClient,
} from '@/lib/record-encrypt-client'
import { updateVaultRecordAction } from '@/server/vault/vault-record'
import { useAuthStore } from '@/store/use-auth-store'
import { NoteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { RecordEditor, type RecordField } from './record-editor'

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
  vault: {
    id: string
    name: string
  }
  records: {
    id: string
    name: string
    type: string
    updatedAt: string
    data?: string
    metadata?: string
  }[]
}

type RecordDialogContentProps = {
  record: {
    id: string
    name: string
    type: string
    updatedAt: string
    data?: string
    metadata?: string
  } | null
  vault: {
    id: string
    name: string
  }
}

type DecryptedRecord = {
  id: string
  updatedAt: string
  name: string
  type: string
  data: RecordField[]
  metadata: RecordField[]
}

type EditableRecordProps = {
  record: DecryptedRecord
  vault: {
    id: string
    name: string
  }
}

function createDataMap(fields: RecordField[]) {
  return Object.fromEntries(fields)
}

export function RecordDialog({ vault, records }: RecordDialogProps) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const recordId = searchParams.get('record')?.trim() ?? ''
  const record = records.find((item) => item.id === recordId) ?? null

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
        <RecordDialogContent key={recordId} record={record} vault={vault} />
      )}
    </BetterDialog>
  )
}

function RecordDialogContent({ record, vault }: RecordDialogContentProps) {
  const auth = useAuthStore(
    (state) => state.vaultAuthByVaultId[vault.id] ?? null
  )
  const recordQuery = useQuery({
    enabled: Boolean(auth && record),
    queryFn: async () => {
      if (!record) {
        throw new Error('Record not found.')
      }

      if (!auth) {
        throw new Error('Unlock this vault first.')
      }

      const decrypted = await decryptRecordClient({
        key: auth,
        data: record.data,
        metadata: record.metadata,
      })

      return {
        ...record,
        data: decrypted.data ? Object.entries(decrypted.data) : [],
        metadata: decrypted.metadata ?? [],
      }
    },
    queryKey: ['vault-record', vault.id, record?.id, record?.updatedAt, auth],
  })

  if (recordQuery.isPending) {
    return (
      <BetterDialogContent
        title="Loading record"
        description="Fetching record details."
      >
        <div className="flex min-h-56 items-center justify-center">
          <Loading className="text-primary size-10 shrink-0" />
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

  if (!record) {
    return (
      <BetterDialogContent
        title="Could not load record"
        description="This record could not be opened."
        footerCancel
      >
        <Alert variant="destructive">
          <AlertTitle>Record unavailable</AlertTitle>
          <AlertDescription>Record not found.</AlertDescription>
        </Alert>
      </BetterDialogContent>
    )
  }

  return (
    <EditableRecord
      key={recordQuery.data.updatedAt}
      record={recordQuery.data}
      vault={vault}
    />
  )
}

function EditableRecord({ record, vault }: EditableRecordProps) {
  const auth = useAuthStore(
    (state) => state.vaultAuthByVaultId[vault.id] ?? null
  )
  const formRef = useRef<HTMLFormElement>(null)
  const [data, setData] = useState<RecordField[]>(record.data)
  const [metadata, setMetadata] = useState<RecordField[]>(record.metadata)
  const [error, setError] = useState('')
  const [name, setName] = useState(record.name)
  const [type, setType] = useState(record.type)
  const updateRecordMutation = useMutation({
    mutationFn: async (input: {
      data: RecordField[]
      metadata: RecordField[]
      name: string
      type: string
    }) => {
      if (!auth) {
        throw new Error('Unlock this vault first.')
      }

      const encrypted = await encryptRecordClient({
        key: auth,
        data: createDataMap(input.data),
        metadata: input.metadata,
      })

      return updateVaultRecordAction({
        data: encrypted.data ?? undefined,
        metadata: encrypted.metadata ?? undefined,
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
            <HugeiconsIcon icon={NoteIcon} className="size-5" />
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
          metadata={metadata}
          error={error}
          isPending={updateRecordMutation.isPending}
          hideSubmit
          submitLabel="Save changes"
          onNameChange={setName}
          onTypeChange={setType}
          onDataChange={setData}
          onMetadataChange={setMetadata}
          onSubmit={(event) => {
            event.preventDefault()

            updateRecordMutation.mutate(
              {
                data,
                metadata,
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
