'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { Button } from '@/components/ui/button'
import { useVaultContext } from '@/features/vault/contexts/vault-context'
import type { PublicRecordType } from '@/lib/public-schema'
import { decryptRecordClient } from '@/lib/record-encrypt-client'
import { CheckmarkCircle03Icon, Copy02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

type RecordDialogProps = {
  open: boolean
  onOpenChange(open: boolean): void

  record: PublicRecordType
}

export function ViewRecordDialog({ ...props }: RecordDialogProps) {
  return (
    <BetterDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ViewRecordDialogContent {...props} />
    </BetterDialog>
  )
}

function ViewRecordDialogContent({ record }: RecordDialogProps) {
  const { secret } = useVaultContext()

  const decryptQuery = useQuery({
    queryKey: [
      'record-dialog-decrypt',
      record.id,
      record.data,
      record.metadata,
      secret,
    ],

    queryFn: () => {
      return decryptRecordClient({
        key: secret,
        data: record.data,
        metadata: record.metadata,
      })
    },
  })

  const dataFields = Object.entries(decryptQuery.data?.data ?? {})
  const metadataFields = decryptQuery.data?.metadata ?? []

  return (
    <BetterDialogContent
      title={record.name}
      description={
        <div className="flex flex-wrap items-center gap-2">
          {record.type?.trim() ? (
            <Badge variant="outline" className="rounded-full">
              {record.type}
            </Badge>
          ) : null}
          {record.tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="rounded-full opacity-60"
            >
              {tag}
            </Badge>
          ))}
          <span className="text-muted-foreground text-sm">
            Updated {new Date(record.updatedAt).toLocaleDateString()}
          </span>
        </div>
      }
    >
      {decryptQuery.isPending ? (
        <RecordDialogSkeleton />
      ) : decryptQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not decrypt this record.</AlertTitle>
          <AlertDescription>
            Check your vault PIN and try again.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-1">
          <RecordFieldSection fields={dataFields} />
          <RecordFieldSection fields={metadataFields} />
        </div>
      )}
    </BetterDialogContent>
  )
}

type RecordFieldSectionProps = {
  fields: [string, string][]
}

function RecordFieldSection({ fields }: RecordFieldSectionProps) {
  return (
    <div className="divide-border divide-y">
      {fields.map(([key, value]) => (
        <FieldRow key={key} label={key} value={value} />
      ))}
    </div>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-x-4 gap-y-1 px-4 py-2.5">
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-mono text-sm break-words whitespace-pre-wrap">
        {value}
      </p>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground/60 hover:text-foreground flex size-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
        onClick={handleCopy}
      >
        <HugeiconsIcon
          icon={copied ? CheckmarkCircle03Icon : Copy02Icon}
          className="size-3.5"
        />
      </Button>
    </div>
  )
}

function RecordDialogSkeleton() {
  return (
    <div className="divide-border divide-y">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-4 py-2.5"
        >
          <div className="bg-muted h-3 w-16 animate-pulse rounded" />
          <div className="bg-muted h-4 w-full animate-pulse rounded" />
        </div>
      ))}
    </div>
  )
}
