'use client'

import { LoadingSection } from '@/components/loading'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { useVaultContext } from '@/features/vault/contexts/vault-context'
import { decryptRecordClient } from '@/lib/record-encrypt-client'
import type { PublicRecordType } from '@/lib/schema'
import { useQuery } from '@tanstack/react-query'

type RecordDialogProps = {
  open: boolean
  onOpenChange(open: boolean): void

  record: PublicRecordType
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

function RecordDialogContent({ record }: RecordDialogProps) {
  const { secret } = useVaultContext()

  const decryptQuery = useQuery({
    queryKey: [
      'record-dialog-decrypt',
      record.id,
      record.data,
      record.metadata,
      secret,
    ],
    queryFn: async () => {
      return decryptRecordClient({
        key: secret,
        data: record.data,
        metadata: record.metadata,
      })
    },
    enabled: record.data === 'string' || typeof record.metadata === 'string',
  })

  const dataFields = Object.entries(decryptQuery.data?.data ?? {})
  const metadataFields = decryptQuery.data?.metadata ?? []

  return (
    <BetterDialogContent
      title={record.name}
      description={`Type: ${record.type || 'Not set'} | Updated ${new Date(record.updatedAt).toLocaleDateString()}`}
      footerCancel
      className="space-y-5"
    >
      {decryptQuery.isPending ? (
        <LoadingSection />
      ) : decryptQuery.isError ? (
        <Alert variant="destructive">
          <AlertTitle>Could not decrypt this record.</AlertTitle>
          <AlertDescription>
            Check your vault PIN and try again.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          <section className="border-border bg-card rounded-[1.5rem] border p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-medium">Data fields</h2>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {dataFields.length} fields
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {dataFields.length === 0 ? (
                <div className="text-muted-foreground border-border bg-background rounded-[1rem] border p-3 text-sm">
                  No data fields yet.
                </div>
              ) : (
                dataFields.map((field, index) => (
                  <div
                    key={`${index}-${field[0]}`}
                    className="border-border bg-background grid gap-3 rounded-[1rem] border p-3 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]"
                  >
                    <div>
                      <p className="text-muted-foreground text-xs">Key</p>
                      <p className="mt-1 text-sm font-medium break-all">
                        {field[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Value</p>
                      <p className="mt-1 text-sm break-all whitespace-pre-wrap">
                        {field[1]}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="border-border bg-card rounded-[1.5rem] border p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-medium">Metadata fields</h2>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {metadataFields.length} fields
              </Badge>
            </div>

            <div className="mt-4 space-y-3">
              {metadataFields.length === 0 ? (
                <div className="text-muted-foreground border-border bg-background rounded-[1rem] border p-3 text-sm">
                  No metadata fields yet.
                </div>
              ) : (
                metadataFields.map((field, index) => (
                  <div
                    key={`${index}-${field[0]}`}
                    className="border-border bg-background grid gap-3 rounded-[1rem] border p-3 sm:grid-cols-[minmax(0,0.45fr)_minmax(0,1fr)]"
                  >
                    <div>
                      <p className="text-muted-foreground text-xs">Key</p>
                      <p className="mt-1 text-sm font-medium break-all">
                        {field[0]}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Value</p>
                      <p className="mt-1 text-sm break-all whitespace-pre-wrap">
                        {field[1]}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </>
      )}
    </BetterDialogContent>
  )
}
