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
import { TagInput } from '@/components/ui/tag-input'
import { RECORD_TYPES } from '@/features/vault/constants/record-types'
import {
  buildRecordCreateFormSchema,
  CreateRecordFormInput,
  CreateRecordFormOutput,
} from '@/features/vault/helpers/build-zod-schema'
import { zodResolver } from '@hookform/resolvers/zod'
import { File01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMemo, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { CreateRecordDataForm } from './create-record-data-form'
import { CreateRecordMetadataForm } from './create-record-metadata-form'

type RecordConfigureDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void

  defaultValues?: Partial<CreateRecordFormOutput>
  onSubmit: (data: CreateRecordFormOutput) => Promise<void>
}

export function ConfigureRecordDialog({
  ...props
}: RecordConfigureDialogProps) {
  return (
    <BetterDialog open={props.open} onOpenChange={props.onOpenChange}>
      <ConfigureRecordDialogContent {...props} />
    </BetterDialog>
  )
}

function ConfigureRecordDialogContent({
  defaultValues,
  onSubmit,
}: RecordConfigureDialogProps) {
  const [selectedType, setSelectedType] = useState(defaultValues?.type ?? '')

  const selectedRecordType = useMemo(
    () => RECORD_TYPES.find((recordType) => recordType.id === selectedType),
    [selectedType]
  )

  const recordCreateFormSchema = useMemo(
    () => buildRecordCreateFormSchema(selectedRecordType),
    [selectedRecordType]
  )

  const formRef = useRef<HTMLFormElement>(null)
  const form = useForm<CreateRecordFormInput>({
    defaultValues: {
      name: defaultValues?.name ?? '',
      tags: defaultValues?.tags ?? [],
      data: defaultValues?.data ?? {},
      metadata: defaultValues?.metadata ?? [],
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
              await onSubmit({ ...values, type: selectedType })
            } catch (err) {
              if (err instanceof Error) {
                form.setError('root', { message: err.message })
              }
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
                name="type"
                render={() => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <FormControl>
                      <Select
                        value={selectedType}
                        onValueChange={setSelectedType}
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

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <TagInput
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      placeholder="production, backend"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
