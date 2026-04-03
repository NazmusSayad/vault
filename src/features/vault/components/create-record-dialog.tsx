'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RECORD_TYPES } from '@/features/vault/constants/types'
import {
  buildRecordCreateFormSchema,
  CreateRecordFormValues,
  encryptAndPrepareData,
} from '@/features/vault/helpers/build-zod-schema'
import { queryClient } from '@/lib/query-client'
import { createVaultRecordAction } from '@/server/vault/vault-record'
import { zodResolver } from '@hookform/resolvers/zod'
import { File01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { useVaultContext } from '../contexts/vault-context'
import { CreateRecordDataForm } from './create-record-data-form'
import { CreateRecordMetadataForm } from './create-record-metadata-form'

type RecordCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateRecordDialog({
  open,
  onOpenChange,
}: RecordCreateDialogProps) {
  return (
    <BetterDialog open={open} onOpenChange={onOpenChange}>
      <CreateRecordDialogContent open={open} onOpenChange={onOpenChange} />
    </BetterDialog>
  )
}

function CreateRecordDialogContent({ onOpenChange }: RecordCreateDialogProps) {
  const { secret, vault } = useVaultContext()
  const [selectedType, setSelectedType] = useState('')
  const selectedRecordType = useMemo(
    () => RECORD_TYPES.find((recordType) => recordType.id === selectedType),
    [selectedType]
  )
  const recordCreateFormSchema = useMemo(
    () => buildRecordCreateFormSchema(selectedRecordType),
    [selectedRecordType]
  )
  const formRef = useRef<HTMLFormElement>(null)
  const form = useForm<CreateRecordFormValues>({
    defaultValues: {
      name: '',
      type: '',
      tags: [],
      data: {},
      metadata: [],
    },
    resolver: zodResolver(recordCreateFormSchema),
  })

  return (
    <BetterDialogContent
      title="Create a new record"
      description="Add the name, choose the type, and define the key-value fields."
      className="space-y-1"
      footerCancel
      footerSubmit="Create record"
      footerSubmitIcon={<HugeiconsIcon icon={File01Icon} className="size-4" />}
      footerSubmitLoading={form.formState.isSubmitting}
      onFooterSubmitClick={() => formRef.current?.requestSubmit()}
    >
      <Form {...form}>
        <form
          ref={formRef}
          className="space-y-6"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              if (!secret) {
                throw new Error('Unlock this vault first.')
              }

              const encrypted = await encryptAndPrepareData(secret, values)

              await createVaultRecordAction({
                auth: secret,
                vaultId: vault.id,
                ...encrypted,
              })

              onOpenChange(false)

              await Promise.all([
                queryClient.invalidateQueries({
                  queryKey: ['vault', vault.id],
                }),
                queryClient.invalidateQueries({
                  queryKey: ['vault-record', vault.id],
                }),
                queryClient.invalidateQueries({ queryKey: ['vaults'] }),
              ])

              toast.success('Record created.')
            } catch (mutationError) {
              form.setError('root', {
                message:
                  mutationError instanceof Error
                    ? mutationError.message
                    : 'Could not create the record.',
              })
            }
          })}
        >
          <fieldset
            disabled={form.formState.isSubmitting}
            className="space-y-6 disabled:pointer-events-none disabled:opacity-80"
          >
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Primary database" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        value={selectedType}
                        onValueChange={(nextType) => {
                          const nextRecordType = RECORD_TYPES.find(
                            (recordType) => recordType.id === nextType
                          )

                          setSelectedType(nextType)
                          field.onChange(nextType)

                          form.setValue(
                            'data',
                            nextRecordType
                              ? Object.fromEntries(
                                  nextRecordType.fields.map((recordField) => [
                                    recordField.id,
                                    '',
                                  ])
                                )
                              : {},
                            { shouldValidate: true }
                          )
                        }}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a record type" />
                        </SelectTrigger>

                        <SelectContent>
                          {RECORD_TYPES.map((recordType) => (
                            <SelectItem
                              key={recordType.id}
                              value={recordType.id}
                            >
                              <HugeiconsIcon icon={recordType.icon} />
                              {recordType.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {selectedRecordType && (
              <CreateRecordDataForm
                form={form}
                selectedRecordType={selectedRecordType}
              />
            )}

            <CreateRecordMetadataForm form={form} />
          </fieldset>

          {form.formState.errors.root?.message ? (
            <Alert variant="destructive">
              <AlertTitle>Could not save record</AlertTitle>
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          ) : null}
        </form>
      </Form>
    </BetterDialogContent>
  )
}
