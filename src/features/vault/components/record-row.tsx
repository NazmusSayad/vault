import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableCell, TableRow } from '@/components/ui/table'
import type { PublicRecordType } from '@/lib/public-schema'
import {
  ArrowRight02Icon,
  Delete02Icon,
  FolderEditIcon,
  MoreVerticalIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { resolveRecordIcon } from '../constants/record-types'
import { ViewRecordDialog } from './view-record-dialog'

type RecordRowProps = {
  record: PublicRecordType
}

export function RecordRow({ record }: RecordRowProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  return (
    <>
      <TableRow
        className="cursor-pointer"
        onClick={() => router.replace(`?record=${record.id}`)}
      >
        <TableCell className="py-4">
          <div className="flex items-center gap-2">
            <HugeiconsIcon
              icon={resolveRecordIcon(record.type)}
              className="ml-2 size-5"
            />

            <span className="font-medium">{record.name}</span>
          </div>
        </TableCell>

        <TableCell className="text-muted-foreground">
          {new Date(record.updatedAt).toLocaleDateString()}
        </TableCell>

        <TableCell>
          <div className="flex flex-wrap gap-1.5">
            {record.tags.length === 0 ? (
              <span className="text-muted-foreground text-sm">No tags</span>
            ) : (
              record.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  {tag}
                </Badge>
              ))
            )}
            {record.tags.length > 3 ? (
              <Badge variant="outline" className="rounded-full">
                +{record.tags.length - 3}
              </Badge>
            ) : null}
          </div>
        </TableCell>

        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="-mr-1"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                }}
              >
                <HugeiconsIcon icon={MoreVerticalIcon} className="size-4" />
                <span className="sr-only">Record actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <HugeiconsIcon icon={FolderEditIcon} className="size-4" />
                Edit Record
              </DropdownMenuItem>

              <DropdownMenuItem>
                <HugeiconsIcon icon={ArrowRight02Icon} className="size-4" />
                Move to Vault
              </DropdownMenuItem>

              <DropdownMenuItem variant="destructive">
                <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                Delete Record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <ViewRecordDialog
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
