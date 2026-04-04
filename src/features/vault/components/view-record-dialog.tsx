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
          ) : (
            <Badge variant="outline" className="rounded-full opacity-50">
              No type
            </Badge>
          )}
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
    <div>
      {fields.map(([key, value], index) => (
        <div key={key}>
          <FieldRow label={key} value={value} />
          {index < fields.length - 1 && (
            <div className="border-border mr-4 ml-14 border-b" />
          )}
        </div>
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
    <div className="group px-4 py-3">
      <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
        {label}
      </p>
      <div className="flex items-start justify-between gap-3">
        <p className="pr-2 text-sm break-words whitespace-pre-wrap">{value}</p>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground flex size-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={handleCopy}
        >
          <HugeiconsIcon
            icon={copied ? CheckmarkCircle03Icon : Copy02Icon}
            className="size-4"
          />
        </Button>
      </div>
    </div>
  )
}

function RecordDialogSkeleton() {
  return Array.from({ length: 4 }).map((_, i) => (
    <div key={i} className="px-4 py-3">
      <div className="bg-muted mb-2 h-3 w-20 animate-pulse rounded" />
      <div className="bg-muted h-4 w-full animate-pulse rounded" />
    </div>
  ))
}
