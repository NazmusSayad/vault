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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { ArrowRight01Icon } from '@hugeicons/core-free-icons'
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
import { useMemo, useState } from 'react'
import { RecordRow } from './record-row'

function parseTagsFromMetadata(metadata?: string) {
  if (!metadata) {
    return [] as string[]
  }

  try {
    const parsed = JSON.parse(metadata)

    if (Array.isArray(parsed)) {
      const tagsField = parsed.find(
        (item) =>
          Array.isArray(item) &&
          item.length >= 2 &&
          String(item[0]).toLowerCase() === 'tags'
      )

      if (Array.isArray(tagsField) && typeof tagsField[1] === 'string') {
        return tagsField[1]
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      }
    }

    if (
      typeof parsed === 'object' &&
      parsed !== null &&
      'tags' in parsed &&
      Array.isArray(parsed.tags)
    ) {
      return parsed.tags
        .map((tag: unknown) => String(tag).trim())
        .filter(Boolean)
    }
  } catch {
    return []
  }

  return []
}

// MUST USE ./record-row.tsx for each record row

export function RecordsList({ records }: { records: PublicRecordType[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'lastUpdated', desc: true },
  ])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')

  const data = useMemo(
    () =>
      records.map((record) => {
        const tags = parseTagsFromMetadata(record.metadata)

        return {
          record,
          tags,
          tagsLabel: tags.join(', '),
          updatedAtTs: new Date(record.updatedAt).getTime(),
        }
      }),
    [records]
  )

  const table = useReactTable({
    data,
    columns: [
      {
        id: 'name',
        accessorFn: (row) => row.record.name,
        header: 'Name',
      },
      {
        id: 'type',
        accessorFn: (row) => row.record.type?.trim() || 'N/A',
        header: 'Type',
        filterFn: (row, columnId, filterValue) => {
          if (!filterValue) {
            return true
          }

          return row.getValue(columnId) === filterValue
        },
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
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, _columnId, filterValue) => {
      const search = String(filterValue).trim().toLowerCase()

      if (!search) {
        return true
      }

      const name = String(row.getValue('name')).toLowerCase()
      const type = String(row.getValue('type')).toLowerCase()
      const tags = String(row.getValue('tags')).toLowerCase()

      return (
        name.includes(search) || type.includes(search) || tags.includes(search)
      )
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set(records.map((record) => record.type?.trim() || 'N/A'))
      ).sort((a, b) => a.localeCompare(b)),
    [records]
  )

  const tagOptions = useMemo(
    () => Array.from(new Set(data.flatMap((row) => row.tags))).sort(),
    [data]
  )

  const typeFilterValue =
    String(table.getColumn('type')?.getFilterValue() ?? 'all') || 'all'
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
          placeholder="Filter by name, type, or tags"
          className="h-10 w-full sm:max-w-sm"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={typeFilterValue}
            onValueChange={(value) => {
              table
                .getColumn('type')
                ?.setFilterValue(value === 'all' ? undefined : value)
            }}
          >
            <SelectTrigger className="h-10 min-w-44">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {typeOptions.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" className="h-10 min-w-44">
                {selectedTags.length === 0
                  ? 'Tags'
                  : `Tags (${selectedTags.length})`}
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter tags</DropdownMenuLabel>
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

              {selectedTags.length > 0 ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(event) => {
                      event.preventDefault()
                      table.getColumn('tags')?.setFilterValue(undefined)
                    }}
                  >
                    Clear tags filter
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-border bg-card overflow-hidden rounded-lg border shadow-sm">
        <Table>
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
