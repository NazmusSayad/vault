'use client'

import { encryptAndPrepareData } from '@/features/vault/helpers/build-zod-schema'
import { PublicRecordType } from '@/lib/public-schema'
import { queryClient } from '@/lib/query-client'
import { updateVaultRecordAction } from '@/server/vault/vault-record'
import { toast } from 'sonner'
import { useVaultContext } from '../contexts/vault-context'
import { ConfigureRecordDialog } from './configure-record-dialog'

type RecordUpdateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  record: PublicRecordType
}

export function UpdateRecordDialog({
  open,
  record,
  onOpenChange,
}: RecordUpdateDialogProps) {
  const { secret, vault } = useVaultContext()

  return (
    <ConfigureRecordDialog
      open={open}
      onOpenChange={onOpenChange}
      defaultValues={{}}
      onSubmit={async (values) => {
        try {
          const encrypted = await encryptAndPrepareData(secret, values)

          await updateVaultRecordAction({
            vaultId: vault.id,
            recordId: record.id,
            ...encrypted,
          })

          onOpenChange(false)

          await Promise.all([
            queryClient.invalidateQueries({
              queryKey: ['vault', vault.id],
            }),
            queryClient.invalidateQueries({
              queryKey: ['vault-record', vault.id],
            }),
            queryClient.invalidateQueries({ queryKey: ['vaults'] }),
          ])

          toast.success('Record updated.')
        } catch (mutationError) {
          throw new Error(
            mutationError instanceof Error
              ? mutationError.message
              : 'Could not update the record.'
          )
        }
      }}
    />
  )
}
