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
import { AnimatePresence, motion } from 'framer-motion'
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
      title={
        <div className="flex items-center gap-2">
          <span>{record.name}</span>
          {record.type?.trim() && (
            <Badge
              variant="secondary"
              className="rounded-full px-2 py-0.5 text-[0.625rem] font-medium uppercase"
            >
              {record.type}
            </Badge>
          )}
        </div>
      }
      description={`Updated: ${new Date(record.updatedAt).toLocaleDateString()}`}
    >
      <motion.div layout className="overflow-hidden">
        <AnimatePresence mode="sync" initial={false}>
          {decryptQuery.isPending && (
            <motion.div
              key="pending"
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <RecordDialogSkeleton />
            </motion.div>
          )}

          {decryptQuery.isError && (
            <motion.div
              key="error"
              layout
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <Alert variant="destructive">
                <AlertTitle>Could not decrypt this record.</AlertTitle>
                <AlertDescription>
                  Check your vault PIN and try again.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}

          {!decryptQuery.isPending && !decryptQuery.isError && (
            <motion.div
              key="content"
              layout
              className="space-y-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {dataFields.length > 0 && (
                <div className="bg-muted/30 divide-border divide-y rounded-lg border">
                  {dataFields.map(([key, value]) => (
                    <FieldRow key={key} label={key} value={value} />
                  ))}
                </div>
              )}

              {metadataFields.length > 0 && (
                <div className="bg-muted/30 divide-border divide-y rounded-lg border">
                  {metadataFields.map(([key, value]) => (
                    <FieldRow key={key} label={key} value={value} />
                  ))}
                </div>
              )}

              {record.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  {record.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="rounded-full px-2.5 py-1 text-xs"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </BetterDialogContent>
  )
}

function FieldRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const isLongValue = value.length > 60
  const isMultiline = value.includes('\n')

  return (
    <div className="group hover:bg-muted/50 flex items-start gap-3 px-4 py-3 transition-colors">
      <div className="max-w-[8rem] min-w-[6rem] flex-shrink-0 pt-0.5">
        <p className="text-muted-foreground text-xs font-medium capitalize">
          {label}
        </p>
      </div>
      <div className="min-w-0 flex-1">
        <p
          className={`text-sm break-all ${isLongValue || isMultiline ? 'font-mono text-xs leading-relaxed' : 'font-medium'} `}
        >
          {value}
        </p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground/60 hover:text-foreground -mr-1 flex size-7 shrink-0 opacity-0 transition-all group-hover:opacity-100"
        onClick={handleCopy}
        title="Copy to clipboard"
      >
        <HugeiconsIcon
          icon={copied ? CheckmarkCircle03Icon : Copy02Icon}
          className={copied ? 'size-4 text-green-600' : 'size-4'}
        />
      </Button>
    </div>
  )
}

function RecordDialogSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-muted h-6 w-20 animate-pulse rounded-full" />
        <div className="bg-muted h-6 w-16 animate-pulse rounded-full" />
      </div>
      <div className="space-y-3">
        <div className="bg-muted h-4 w-12 animate-pulse rounded" />
        <div className="bg-muted/30 divide-border divide-y rounded-lg border">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 px-4 py-3">
              <div className="bg-muted h-3 w-16 animate-pulse rounded" />
              <div className="bg-muted h-4 w-full animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
