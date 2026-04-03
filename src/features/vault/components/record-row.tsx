import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import type { PublicRecordType } from '@/lib/schema'
import { NoteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RecordDialog } from './record-dialog'

type RecordRowProps = {
  record: PublicRecordType
}

export function RecordRow({ record }: RecordRowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <>
      <TableRow onClick={() => router.replace(`?record=${record.id}`)}>
        <TableCell className="flex items-center gap-2 py-4">
          <span className="bg-muted flex size-9 items-center justify-center rounded-xl">
            <HugeiconsIcon icon={NoteIcon} className="size-4" />
          </span>
          <span>{record.name}</span>
        </TableCell>

        <TableCell>
          <Badge variant="outline">{record.type}</Badge>
        </TableCell>

        <TableCell className="text-muted-foreground">
          {new Date(record.updatedAt).toLocaleDateString()}
        </TableCell>
      </TableRow>

      <RecordDialog
        record={record}
        open={searchParams.get('record') === record.id}
        onOpenChange={(open) => {
          if (!open) {
            const clonedSearchParams = new URLSearchParams(
              searchParams.toString()
            )

            clonedSearchParams.delete('record')
            router.replace(`?${clonedSearchParams.toString()}`)
          }
        }}
      />
    </>
  )
}
