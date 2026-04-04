'use client'

import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Add01Icon, Delete02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useFieldArray, type UseFormReturn } from 'react-hook-form'
import { CreateRecordFormInput } from '../helpers/build-zod-schema'

type CreateRecordMetadataFormProps = {
  form: UseFormReturn<CreateRecordFormInput>
}

export function CreateRecordMetadataForm({
  form,
}: CreateRecordMetadataFormProps) {
  const metadataFieldArray = useFieldArray({
    control: form.control,
    name: 'metadata',
  })

  return (
    <div className="space-y-4">
      {metadataFieldArray.fields.map((metadataField, index) => (
        <div
          key={metadataField.id}
          className="grid gap-3 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1fr)_auto] lg:items-start"
        >
          <FormField
            control={form.control}
            name={`metadata.${index}.0`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Key</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="environment" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`metadata.${index}.1`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Textarea {...field} placeholder="production" />
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
              onClick={() => metadataFieldArray.remove(index)}
            >
              <HugeiconsIcon icon={Delete02Icon} className="size-4" />
              <span className="sr-only">Remove metadata field</span>
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={() => metadataFieldArray.append(['', ''])}
      >
        <HugeiconsIcon icon={Add01Icon} className="size-4" />
        Add field
      </Button>
    </div>
  )
}
