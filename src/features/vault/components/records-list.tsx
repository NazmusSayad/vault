'use client'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { PublicRecordType } from '@/lib/public-schema'
import { cn } from '@/lib/utils'
import {
  ArrowRight01Icon,
  Cancel01Icon,
  Tag01Icon,
  TagsIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table'
import Fuse from 'fuse.js'
import { useMemo, useState } from 'react'
import { RecordRow } from './record-row'

export function RecordsList({ records }: { records: PublicRecordType[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'lastUpdated', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const data = useMemo(
    () =>
      records.map((record) => {
        return {
          record,
          tags: record.tags,
          tagsLabel: record.tags.join(', '),
          updatedAtTs: new Date(record.updatedAt).getTime(),
        }
      }),
    [records]
  )

  const filteredData = useMemo(() => {
    const search = globalFilter.trim()

    if (!search) {
      return data
    }

    return new Fuse(data, {
      keys: ['record.name', 'tagsLabel'],
      threshold: 0.35,
      ignoreLocation: true,
    })
      .search(search)
      .map((result) => result.item)
  }, [data, globalFilter])

  const table = useReactTable({
    data: filteredData,
    columns: [
      {
        id: 'name',
        accessorFn: (row) => row.record.name,
        header: 'Name',
      },
      {
        id: 'lastUpdated',
        accessorFn: (row) => row.updatedAtTs,
        header: 'Last updated',
      },
      {
        id: 'tags',
        accessorFn: (row) => row.tagsLabel,
        header: 'Tags',
        filterFn: (row, _columnId, filterValue) => {
          if (!Array.isArray(filterValue) || filterValue.length === 0) {
            return true
          }

          const selectedTags = filterValue.map((tag) => String(tag))

          return selectedTags.some((tag) => row.original.tags.includes(tag))
        },
      },
      {
        id: 'actions',
        accessorFn: () => '',
        enableGlobalFilter: false,
        enableSorting: false,
        header: () => null,
      },
    ],
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const tagOptions = useMemo(
    () => Array.from(new Set(data.flatMap((row) => row.tags))).sort(),
    [data]
  )

  const tagsFilterValue = table.getColumn('tags')?.getFilterValue()
  const selectedTags = Array.isArray(tagsFilterValue)
    ? tagsFilterValue.map((tag) => String(tag))
    : []

  return (
    <section className="space-y-4 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          placeholder="Filter by name or tags"
          className="w-full sm:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="relative size-9"
              >
                <HugeiconsIcon icon={Tag01Icon} className="size-4" />
                {selectedTags.length > 0 ? (
                  <span className="bg-primary text-primary-foreground absolute -top-1 -right-1.5 inline-flex min-w-5 items-center justify-center rounded-full px-1 text-xs font-medium">
                    {selectedTags.length}
                  </span>
                ) : null}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              {selectedTags.length > 0 ? (
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault()
                    table.getColumn('tags')?.setFilterValue(undefined)
                  }}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="size-4" />
                  Clear tags filter
                </DropdownMenuItem>
              ) : (
                <DropdownMenuLabel className="flex items-center gap-2">
                  <HugeiconsIcon icon={TagsIcon} className="size-4" />
                  Filter by tags
                </DropdownMenuLabel>
              )}
              <DropdownMenuSeparator />

              {tagOptions.length === 0 ? (
                <DropdownMenuItem disabled>No tags available</DropdownMenuItem>
              ) : (
                tagOptions.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.includes(tag)}
                    onSelect={(event) => event.preventDefault()}
                    onCheckedChange={(checked) => {
                      const nextTags =
                        checked === true
                          ? Array.from(new Set([...selectedTags, tag]))
                          : selectedTags.filter((value) => value !== tag)

                      table
                        .getColumn('tags')
                        ?.setFilterValue(
                          nextTags.length === 0 ? undefined : nextTags
                        )
                    }}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
        <Table className="table-fixed">
          <colgroup>
            <col className="w-[42%]" />
            <col className="w-[16%]" />
            <col className="w-[34%]" />
            <col className="w-[8%]" />
          </colgroup>

          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, i) => {
                  const canSort = header.column.getCanSort()
                  const sorted = header.column.getIsSorted()

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(i === 0 && 'pl-4')}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          className="hover:text-foreground text-muted-foreground inline-flex items-center gap-2 transition-colors"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}

                          <HugeiconsIcon
                            icon={ArrowRight01Icon}
                            className={
                              sorted === 'asc'
                                ? 'text-foreground size-3.5 -rotate-90 transition-transform'
                                : sorted === 'desc'
                                  ? 'text-foreground size-3.5 rotate-90 transition-transform'
                                  : 'text-muted-foreground size-3.5 transition-transform'
                            }
                          />
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="text-muted-foreground px-4 py-12 text-center text-sm"
                >
                  No records match your filter.
                </TableCell>
              </TableRow>
            ) : (
              table
                .getRowModel()
                .rows.map((row) => (
                  <RecordRow
                    key={row.original.record.id}
                    record={row.original.record}
                  />
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
