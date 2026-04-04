'use client'

import { encryptAndPrepareData } from '@/features/vault/helpers/build-zod-schema'
import { queryClient } from '@/lib/query-client'
import { createVaultRecordAction } from '@/server/vault/vault-record'
import { toast } from 'sonner'
import { useVaultContext } from '../contexts/vault-context'
import { ConfigureRecordDialog } from './configure-record-dialog'

type RecordCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRecordDialog({
  open,
  onOpenChange,
}: RecordCreateDialogProps) {
  const { secret, vault } = useVaultContext()

  return (
    <ConfigureRecordDialog
      open={open}
      onOpenChange={onOpenChange}
      onSubmit={async (values) => {
        try {
          const encrypted = await encryptAndPrepareData(secret, values)

          await createVaultRecordAction({
            auth: secret,
            vaultId: vault.id,
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

          toast.success('Record created.')
        } catch (mutationError) {
          throw new Error(
            mutationError instanceof Error
              ? mutationError.message
              : 'Could not create the record.'
          )
        }
      }}
    />
  )
}
