'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { Button } from '@/components/ui/button'
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
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { RECORD_TYPES } from '@/features/vault/constants/types'
import { queryClient } from '@/lib/query-client'
import { encryptRecordClient } from '@/lib/record-encrypt-client'
import { createVaultRecordAction } from '@/server/vault/vault-record'
import { useAuthStore } from '@/store/use-auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Add01Icon,
  Delete02Icon,
  File01Icon,
  NoteIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import { InputType } from 'node:zlib'
import { useRef } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type RecordCreateDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  vaultId: string
}

const recordTypeIds = RECORD_TYPES.map((recordType) => recordType.id)

function getRecordTypeById(typeId: string) {
  return RECORD_TYPES.find((recordType) => recordType.id === typeId)
}

function createDefaultFieldValue(fieldType: InputType) {
  if (fieldType === 'boolean') {
    return 'false'
  }

  return ''
}

function createDefaultDataByType(typeId: string) {
  const recordType = getRecordTypeById(typeId)

  if (!recordType) {
    return {}
  }

  return Object.fromEntries(
    recordType.fields.map((field) => [
      field.id,
      createDefaultFieldValue(field.type),
    ])
  )
}

function createDataFieldSchema(fieldType: InputType) {
  if (fieldType === 'number') {
    return z
      .string()
      .trim()
      .min(1, 'Enter a value.')
      .refine((value) => !Number.isNaN(Number(value)), 'Enter a valid number.')
  }

  if (fieldType === 'boolean') {
    return z.enum(['true', 'false'], {
      message: 'Select true or false.',
    })
  }

  return z.string().trim().min(1, 'Enter a value.')
}

function createDataSchema(typeId: string) {
  const recordType = getRecordTypeById(typeId)

  if (!recordType) {
    return z.object({}).strict()
  }

  return z
    .object(
      Object.fromEntries(
        recordType.fields.map((field) => [
          field.id,
          createDataFieldSchema(field.type),
        ])
      )
    )
    .strict()
}

const recordCreateFormSchema = z
  .object({
    name: z.string().trim().min(1, 'Enter a record name.'),
    type: z
      .string()
      .trim()
      .min(1, 'Select a record type.')
      .refine(
        (value) => recordTypeIds.includes(value),
        'Select a valid record type.'
      ),
    data: z.record(z.string(), z.string()),
    metadata: z.array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    ),
  })
  .superRefine((values, context) => {
    const result = createDataSchema(values.type).safeParse(values.data)

    if (result.success) {
      return
    }

    for (const issue of result.error.issues) {
      context.addIssue({
        ...issue,
        path: ['data', ...issue.path],
      })
    }
  })

export function CreateRecordDialog({ ...props }: RecordCreateDialogProps) {
  return (
    <BetterDialog width="56rem" {...props}>
      <CreateRecordDialogContent {...props} />
    </BetterDialog>
  )
}

function CreateRecordDialogContent({
  onOpenChange,
  vaultId,
}: RecordCreateDialogProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const initialType = RECORD_TYPES[0]?.id ?? ''
  const auth = useAuthStore(
    (state) => state.vaultAuthByVaultId[vaultId] ?? null
  )
  const form = useForm({
    defaultValues: {
      name: '',
      type: initialType,
      data: createDefaultDataByType(initialType),
      metadata: [{ key: '', value: '' }],
    },
    resolver: zodResolver(recordCreateFormSchema),
  })
  const metadataFieldArray = useFieldArray({
    control: form.control,
    name: 'metadata',
  })
  const selectedRecordType = getRecordTypeById(form.watch('type'))
  const createRecordMutation = useMutation({
    mutationFn: async (input: {
      data: Record<string, string>
      metadata: [string, string][]
      name: string
      type: string
    }) => {
      if (!auth) {
        throw new Error('Unlock this vault first.')
      }

      const encrypted = await encryptRecordClient({
        key: auth,
        data: input.data,
        metadata: input.metadata.length > 0 ? input.metadata : undefined,
      })

      return createVaultRecordAction({
        auth,
        data: encrypted.data ?? undefined,
        metadata: encrypted.metadata ?? undefined,
        name: input.name,
        type: input.type,
        vaultId,
      })
    },
    onSuccess: async () => {
      onOpenChange(false)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vault', vaultId] }),
        queryClient.invalidateQueries({ queryKey: ['vault-record', vaultId] }),
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
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Record name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Primary database"
                      disabled={createRecordMutation.isPending}
                    />
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
                      value={field.value}
                      disabled={createRecordMutation.isPending}
                      onValueChange={(value) => {
                        field.onChange(value)

                        const nextRecordType = getRecordTypeById(value)

                        if (!nextRecordType) {
                          form.setValue('data', {}, { shouldValidate: true })
                          return
                        }

                        const currentData = form.getValues('data')

                        form.setValue(
                          'data',
                          Object.fromEntries(
                            nextRecordType.fields.map((recordField) => [
                              recordField.id,
                              currentData[recordField.id] ??
                                createDefaultFieldValue(recordField.type),
                            ])
                          ),
                          { shouldValidate: true }
                        )
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a record type" />
                      </SelectTrigger>

                      <SelectContent>
                        {RECORD_TYPES.map((recordType) => (
                          <SelectItem key={recordType.id} value={recordType.id}>
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
                      Store fixed fields for this selected record type.
                    </p>
                  </div>
                </div>
              </div>

              <Badge variant="outline" className="rounded-full px-3 py-1">
                {selectedRecordType?.fields.length ?? 0} fields
              </Badge>
            </div>

            <div className="mt-6 space-y-4">
              {selectedRecordType?.fields.map((recordField) => (
                <FormField
                  key={recordField.id}
                  control={form.control}
                  name={`data.${recordField.id}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{recordField.name}</FormLabel>
                      <FormControl>
                        {recordField.type === 'textarea' ? (
                          <Textarea
                            {...field}
                            placeholder={`Enter ${recordField.name.toLowerCase()}`}
                            disabled={createRecordMutation.isPending}
                          />
                        ) : recordField.type === 'boolean' ? (
                          <div className="border-border bg-background flex min-h-10 items-center justify-between rounded-md border px-3">
                            <span className="text-sm">
                              {field.value === 'true' ? 'True' : 'False'}
                            </span>
                            <Switch
                              checked={field.value === 'true'}
                              disabled={createRecordMutation.isPending}
                              onCheckedChange={(checked) =>
                                field.onChange(checked ? 'true' : 'false')
                              }
                            />
                          </div>
                        ) : (
                          <Input
                            {...field}
                            type={
                              recordField.type === 'number' ? 'number' : 'text'
                            }
                            placeholder={`Enter ${recordField.name.toLowerCase()}`}
                            disabled={createRecordMutation.isPending}
                          />
                        )}
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
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
                      Store additional key-value metadata.
                    </p>
                  </div>
                </div>
              </div>

              <Badge variant="outline" className="rounded-full px-3 py-1">
                {metadataFieldArray.fields.length} fields
              </Badge>
            </div>

            <div className="mt-6 space-y-4">
              {metadataFieldArray.fields.map((metadataField, index) => (
                <div
                  key={metadataField.id}
                  className="border-border bg-background grid gap-3 rounded-[1.5rem] border p-4 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)_auto] lg:items-start"
                >
                  <FormField
                    control={form.control}
                    name={`metadata.${index}.key`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Key</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="environment"
                            disabled={createRecordMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`metadata.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Value</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="production"
                            disabled={createRecordMutation.isPending}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex items-end justify-end lg:h-full">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={createRecordMutation.isPending}
                      onClick={() => metadataFieldArray.remove(index)}
                    >
                      <HugeiconsIcon icon={Delete02Icon} className="size-4" />
                      <span className="sr-only">Remove metadata field</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-start">
              <Button
                type="button"
                variant="outline"
                disabled={createRecordMutation.isPending}
                onClick={() =>
                  metadataFieldArray.append({ key: '', value: '' })
                }
              >
                <HugeiconsIcon icon={Add01Icon} className="size-4" />
                Add metadata field
              </Button>
            </div>
          </section>

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
