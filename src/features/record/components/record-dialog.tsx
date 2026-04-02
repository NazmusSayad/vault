import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { Vault, VaultRecord } from '@/server/db/.prisma/client'

type RecordDialogProps = {
  open: boolean
  onOpenChange(open: boolean): void

  vault: Vault
  record: VaultRecord
}

export function RecordDialog({ ...props }: RecordDialogProps) {
  return (
    <BetterDialog
      width="56rem"
      open={props.open}
      onOpenChange={props.onOpenChange}
    >
      <RecordDialogContent {...props} />
    </BetterDialog>
  )
}

function RecordDialogContent({}: RecordDialogProps) {
  return <BetterDialogContent>Hello</BetterDialogContent>
}
