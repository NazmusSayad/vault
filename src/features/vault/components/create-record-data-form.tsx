'use client'

import {
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
import { Textarea } from '@/components/ui/textarea'
import type { RecordTypeDetails } from '@/features/vault/constants/record-types'
import type { UseFormReturn } from 'react-hook-form'
import { CreateRecordFormInput } from '../helpers/build-zod-schema'

type CreateRecordDataFormProps = {
  form: UseFormReturn<CreateRecordFormInput>
  selectedRecordType: RecordTypeDetails
}

export function CreateRecordDataForm({
  form,
  selectedRecordType,
}: CreateRecordDataFormProps) {
  return (
    <div className="space-y-4">
      {selectedRecordType.fields.map((recordField) => (
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
                  />
                ) : recordField.type === 'boolean' ? (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a value" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="true">True</SelectItem>
                      <SelectItem value="false">False</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    {...field}
                    type={recordField.type === 'number' ? 'number' : 'text'}
                    placeholder={`Enter ${recordField.name.toLowerCase()}`}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  )
}
