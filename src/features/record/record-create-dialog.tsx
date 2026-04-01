'use client'

import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { EncryptionClient } from '@/lib/encryption/encryption.client'
import { queryClient } from '@/lib/query-client'
import { RecordType } from '@/server/db/.prisma/browser'
import { createVaultRecordAction } from '@/server/vault/vault-record'
import { useAuthStore } from '@/store/use-auth-store'
import { File01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { type ReactNode, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  createEmptyRecordField,
  RecordEditor,
  type RecordField,
} from './record-editor'
import { getRecordDialogHref } from './view-record-dialog'

const encryption = new EncryptionClient()

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
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [data, setData] = useState<RecordField[]>(createInitialFields)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [type, setType] = useState<RecordType>(RecordType.NOTE)
  const createRecordMutation = useMutation({
    mutationFn: async (input: {
      data: RecordField[]
      name: string
      type: RecordType
    }) => {
      if (!auth) {
        throw new Error('Unlock this vault first.')
      }

      return createVaultRecordAction({
        auth,
        data: await encryption.encrypt({
          key: auth,
          data: JSON.stringify(input.data),
        }),
        name: input.name,
        type: input.type,
        vaultId,
      })
    },
    onSuccess: async (result) => {
      onOpenChange(false)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vault', vaultId] }),
        queryClient.invalidateQueries({ queryKey: ['vault-record', vaultId] }),
        queryClient.invalidateQueries({ queryKey: ['vaults'] }),
      ])

      toast.success('Record created.')
      router.push(getRecordDialogHref(pathname, searchParams, result.record.id))
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
        error={error}
        isPending={createRecordMutation.isPending}
        hideSubmit
        submitLabel="Create record"
        onNameChange={setName}
        onTypeChange={setType}
        onDataChange={setData}
        onSubmit={(event) => {
          event.preventDefault()

          createRecordMutation.mutate(
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
