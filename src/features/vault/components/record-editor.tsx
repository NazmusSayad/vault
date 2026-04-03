'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { Textarea } from '@/components/ui/textarea'
import { Add01Icon, Delete02Icon, NoteIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import type { FormEvent, RefObject } from 'react'

export type RecordField = [key: string, value: string]

type RecordEditorProps = {
  data: RecordField[]
  metadata: RecordField[]
  disabled?: boolean
  error?: string
  formRef?: RefObject<HTMLFormElement | null>
  hideSubmit?: boolean
  isPending?: boolean
  name: string
  onDataChange: (data: RecordField[]) => void
  onMetadataChange: (metadata: RecordField[]) => void
  onNameChange: (name: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  onTypeChange: (type: string) => void
  submitLabel: string
  type: string
}

export function createEmptyRecordField(): RecordField {
  return ['', '']
}

export function RecordEditor({
  data,
  metadata,
  disabled,
  error,
  formRef,
  hideSubmit,
  isPending,
  name,
  onDataChange,
  onMetadataChange,
  onNameChange,
  onSubmit,
  onTypeChange,
  submitLabel,
  type,
}: RecordEditorProps) {
  return (
    <form ref={formRef} className="space-y-6" onSubmit={onSubmit}>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="record-name">
            Record name
          </label>
          <Input
            id="record-name"
            placeholder="Primary database"
            value={name}
            disabled={disabled}
            onChange={(event) => onNameChange(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Record type</label>
          <Input
            placeholder="Record type"
            value={type}
            disabled={disabled}
            onChange={(event) => onTypeChange(event.target.value)}
          />
        </div>
      </div>

      <section className="border-border bg-card rounded-[2rem] border p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-muted flex size-10 items-center justify-center rounded-2xl">
                <HugeiconsIcon icon={NoteIcon} className="size-4" />
              </span>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Data fields
                </h2>
                <p className="text-muted-foreground text-sm">
                  Store key-value fields for this record.
                </p>
              </div>
            </div>
          </div>

          <Badge variant="outline" className="rounded-full px-3 py-1">
            {data.length} fields
          </Badge>
        </div>

        <div className="mt-6 space-y-4">
          {data.length === 0 && (
            <div className="text-muted-foreground border-border bg-background rounded-[1.5rem] border p-4 text-sm">
              No data fields yet.
            </div>
          )}

          {data.map((field, index) => (
            <div
              key={`${index}-${field[0]}`}
              className="border-border bg-background grid gap-3 rounded-[1.5rem] border p-4 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)_auto] lg:items-start"
            >
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor={`record-key-${index}`}
                >
                  Key
                </label>
                <Input
                  id={`record-key-${index}`}
                  placeholder="username"
                  value={field[0]}
                  disabled={disabled}
                  onChange={(event) => {
                    onDataChange(
                      data.map((item, itemIndex) =>
                        itemIndex === index
                          ? [event.target.value, item[1]]
                          : item
                      )
                    )
                  }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor={`record-value-${index}`}
                >
                  Value
                </label>
                <Textarea
                  id={`record-value-${index}`}
                  placeholder="Enter the field value"
                  value={field[1]}
                  disabled={disabled}
                  onChange={(event) => {
                    onDataChange(
                      data.map((item, itemIndex) =>
                        itemIndex === index
                          ? [item[0], event.target.value]
                          : item
                      )
                    )
                  }}
                />
              </div>

              <div className="flex items-end justify-end lg:h-full">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  onClick={() => {
                    onDataChange(
                      data.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  <span className="sr-only">Remove field</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-start">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() => onDataChange([...data, createEmptyRecordField()])}
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Add data field
          </Button>
        </div>
      </section>

      <section className="border-border bg-card rounded-[2rem] border p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="bg-muted flex size-10 items-center justify-center rounded-2xl">
                <HugeiconsIcon icon={NoteIcon} className="size-4" />
              </span>
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight">
                  Metadata fields
                </h2>
                <p className="text-muted-foreground text-sm">
                  Store additional ordered key-value metadata.
                </p>
              </div>
            </div>
          </div>

          <Badge variant="outline" className="rounded-full px-3 py-1">
            {metadata.length} fields
          </Badge>
        </div>

        <div className="mt-6 space-y-4">
          {metadata.length === 0 && (
            <div className="text-muted-foreground border-border bg-background rounded-[1.5rem] border p-4 text-sm">
              No metadata fields yet.
            </div>
          )}

          {metadata.map((field, index) => (
            <div
              key={`${index}-${field[0]}`}
              className="border-border bg-background grid gap-3 rounded-[1.5rem] border p-4 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)_auto] lg:items-start"
            >
              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor={`record-metadata-key-${index}`}
                >
                  Key
                </label>
                <Input
                  id={`record-metadata-key-${index}`}
                  placeholder="environment"
                  value={field[0]}
                  disabled={disabled}
                  onChange={(event) => {
                    onMetadataChange(
                      metadata.map((item, itemIndex) =>
                        itemIndex === index
                          ? [event.target.value, item[1]]
                          : item
                      )
                    )
                  }}
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-medium"
                  htmlFor={`record-metadata-value-${index}`}
                >
                  Value
                </label>
                <Textarea
                  id={`record-metadata-value-${index}`}
                  placeholder="production"
                  value={field[1]}
                  disabled={disabled}
                  onChange={(event) => {
                    onMetadataChange(
                      metadata.map((item, itemIndex) =>
                        itemIndex === index
                          ? [item[0], event.target.value]
                          : item
                      )
                    )
                  }}
                />
              </div>

              <div className="flex items-end justify-end lg:h-full">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={disabled}
                  onClick={() => {
                    onMetadataChange(
                      metadata.filter((_, itemIndex) => itemIndex !== index)
                    )
                  }}
                >
                  <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                  <span className="sr-only">Remove field</span>
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-start">
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            onClick={() =>
              onMetadataChange([...metadata, createEmptyRecordField()])
            }
          >
            <HugeiconsIcon icon={Add01Icon} className="size-4" />
            Add metadata field
          </Button>
        </div>
      </section>

      {error && (
        <Alert variant="destructive">
          <AlertTitle>Could not save record</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!hideSubmit && (
        <div className="flex justify-end">
          <Button type="submit" disabled={disabled || isPending}>
            {isPending && <Spinner className="size-4" />}
            {submitLabel}
          </Button>
        </div>
      )}
    </form>
  )
}
