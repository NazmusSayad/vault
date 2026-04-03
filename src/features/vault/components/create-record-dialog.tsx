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
import { buildRecordCreateFormSchema } from '@/features/vault/helpers/build-zod-schema'
import { queryClient } from '@/lib/query-client'
import { encryptRecordClient } from '@/lib/record-encrypt-client'
import { createVaultRecordAction } from '@/server/vault/vault-record'
import { zodResolver } from '@hookform/resolvers/zod'
import { File01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
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

type RecordCreateDialogContentProps = {
  onOpenChange: (open: boolean) => void
}

export type CreateRecordFormValues = {
  data: Record<string, string>
  metadata: Array<{ key: string; value: string }>
  name: string
  type: string
}

export function CreateRecordDialog({
  open,
  onOpenChange,
}: RecordCreateDialogProps) {
  return (
    <BetterDialog open={open} onOpenChange={onOpenChange} width="56rem">
      <CreateRecordDialogContent onOpenChange={onOpenChange} />
    </BetterDialog>
  )
}

function CreateRecordDialogContent({
  onOpenChange,
}: RecordCreateDialogContentProps) {
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
      data: {},
      metadata: [],
    },
    resolver: zodResolver(recordCreateFormSchema),
  })
  const createRecordMutation = useMutation({
    mutationFn: async (input: {
      data: Record<string, string>
      metadata: [string, string][]
      name: string
      type: string
    }) => {
      if (!secret) {
        throw new Error('Unlock this vault first.')
      }

      const encrypted = await encryptRecordClient({
        key: secret,
        data: input.data,
        metadata: input.metadata.length > 0 ? input.metadata : undefined,
      })

      return createVaultRecordAction({
        auth: secret,
        data: encrypted.data ?? undefined,
        metadata: encrypted.metadata ?? undefined,
        name: input.name,
        type: input.type,
        vaultId: vault.id,
      })
    },
    onSuccess: async () => {
      onOpenChange(false)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vault', vault.id] }),
        queryClient.invalidateQueries({ queryKey: ['vault-record', vault.id] }),
        queryClient.invalidateQueries({ queryKey: ['vaults'] }),
      ])

      toast.success('Record created.')
    },
  })

  return (
    <BetterDialogContent
      title="Create a new record"
      description="Add the name, choose the type, and define the key-value fields."
      className="space-y-1"
      footerCancel
      footerSubmit="Create record"
      footerSubmitIcon={<HugeiconsIcon icon={File01Icon} className="size-4" />}
      footerSubmitLoading={createRecordMutation.isPending}
      onFooterSubmitClick={() => formRef.current?.requestSubmit()}
    >
      <Form {...form}>
        <form
          ref={formRef}
          className="space-y-6"
          onSubmit={form.handleSubmit((values) => {
            createRecordMutation.mutate(
              {
                data: values.data,
                metadata: values.metadata
                  .map(
                    (field) =>
                      [field.key.trim(), field.value.trim()] as [string, string]
                  )
                  .filter(
                    (field) => field[0].length > 0 && field[1].length > 0
                  ),
                name: values.name,
                type: values.type,
              },
              {
                onError: (mutationError) => {
                  form.setError('root', {
                    message:
                      mutationError instanceof Error
                        ? mutationError.message
                        : 'Could not create the record.',
                  })
                },
              }
            )
          })}
        >
          <fieldset
            disabled={createRecordMutation.isPending}
            className="space-y-6 disabled:pointer-events-none disabled:opacity-80"
          >
            <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Record name</FormLabel>
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
                    <FormLabel>Record type</FormLabel>
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
