'use client'

import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { queryClient } from '@/lib/query-client'
import { encryptRecordClient } from '@/lib/record-encrypt-client'
import { createVaultRecordAction } from '@/server/vault/vault-record'
import { useAuthStore } from '@/store/use-auth-store'
import { File01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import { type ReactNode, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  createEmptyRecordField,
  RecordEditor,
  type RecordField,
} from './record-editor'

type RecordCreateDialogProps = {
  trigger: ReactNode
  vaultId: string
}

type RecordCreateDialogContentProps = {
  onOpenChange: (open: boolean) => void
  vaultId: string
}

function createInitialFields(): RecordField[] {
  return [createEmptyRecordField()]
}

function createDataMap(fields: RecordField[]) {
  return Object.fromEntries(fields)
}

export function RecordCreateDialog({
  trigger,
  vaultId,
}: RecordCreateDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <BetterDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      width="56rem"
    >
      <RecordCreateDialogContent vaultId={vaultId} onOpenChange={setOpen} />
    </BetterDialog>
  )
}

function RecordCreateDialogContent({
  onOpenChange,
  vaultId,
}: RecordCreateDialogContentProps) {
  const auth = useAuthStore(
    (state) => state.vaultAuthByVaultId[vaultId] ?? null
  )
  const formRef = useRef<HTMLFormElement>(null)
  const [data, setData] = useState<RecordField[]>(createInitialFields)
  const [metadata, setMetadata] = useState<RecordField[]>(createInitialFields)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const createRecordMutation = useMutation({
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

      return createVaultRecordAction({
        auth,
        data: encrypted.data ?? undefined,
        metadata: encrypted.metadata ?? undefined,
        name: input.name,
        type: input.type,
        vaultId,
      })
    },
    onSuccess: async () => {
      onOpenChange(false)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vault', vaultId] }),
        queryClient.invalidateQueries({ queryKey: ['vault-record', vaultId] }),
        queryClient.invalidateQueries({ queryKey: ['vaults'] }),
      ])

      toast.success('Record created.')
    },
  })

  return (
    <BetterDialogContent
      title="Create a new record"
      description="Add the name, choose the type, and define the key-value fields."
      className="space-y-1"
      footerCancel
      footerSubmit="Create record"
      footerSubmitIcon={<HugeiconsIcon icon={File01Icon} className="size-4" />}
      footerSubmitLoading={createRecordMutation.isPending}
      onFooterSubmitClick={() => formRef.current?.requestSubmit()}
    >
      <RecordEditor
        formRef={formRef}
        name={name}
        type={type}
        data={data}
        metadata={metadata}
        error={error}
        isPending={createRecordMutation.isPending}
        hideSubmit
        submitLabel="Create record"
        onNameChange={setName}
        onTypeChange={setType}
        onDataChange={setData}
        onMetadataChange={setMetadata}
        onSubmit={(event) => {
          event.preventDefault()

          createRecordMutation.mutate(
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
                    : 'Could not create the record.'
                )
              },
            }
          )
        }}
      />
    </BetterDialogContent>
  )
}
