import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import type { PublicRecordType } from '@/lib/schema'
import { NoteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

type RecordRowProps = {
  record: PublicRecordType
}

export function RecordRow({ record }: RecordRowProps) {
  return (
    <TableRow>
      <TableCell className="py-4">
        <Link
          href={`?record=${record.id}`}
          className="hover:text-primary flex items-center gap-3 font-medium transition-colors"
        >
          <span className="bg-muted flex size-9 items-center justify-center rounded-xl">
            <HugeiconsIcon icon={NoteIcon} className="size-4" />
          </span>
          <span>{record.name}</span>
        </Link>
      </TableCell>
      <TableCell>
        <Badge variant="outline">{record.type}</Badge>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {new Date(record.updatedAt).toLocaleDateString()}
      </TableCell>
    </TableRow>
  )
}
