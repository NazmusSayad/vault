import { encryptRecordClient } from '@/lib/record-encrypt-client'
import { z } from 'zod'
import { FieldInputType, RecordTypeDetails } from '../constants/types'

export type CreateRecordFormValues = {
  name: string
  type: string
  tags: string[]

  data: Record<string, string>
  metadata: Array<[string, string]>
}

function createDataFieldValueSchema(type: FieldInputType) {
  if (type === 'number') {
    return z
      .string()
      .trim()
      .min(1, 'Enter a value.')
      .refine((value) => !Number.isNaN(Number(value)), 'Enter a valid number.')
  }

  if (type === 'boolean') {
    return z.enum(['true', 'false'], {
      message: 'Select true or false.',
    })
  }

  return z.string().trim().min(1, 'Enter a value.')
}

export function buildRecordCreateFormSchema(
  selectedRecordType?: RecordTypeDetails
) {
  return z.object({
    name: z.string().trim().min(1, 'Enter a record name.'),
    type: selectedRecordType
      ? z.literal(selectedRecordType.id)
      : z.string().trim().min(1, 'Select a record type.'),
    data: selectedRecordType
      ? z
          .object(
            Object.fromEntries(
              selectedRecordType.fields.map((field) => [
                field.id,
                createDataFieldValueSchema(field.type),
              ])
            )
          )
          .strict()
      : z.record(z.string(), z.string()),
    metadata: z.array(z.tuple([z.string(), z.string()])),
    tags: z.array(z.string()),
  })
}

export async function encryptAndPrepareData(
  secret: string,
  input: CreateRecordFormValues
) {
  const metadata = input.metadata
    .map((field) => [field[0].trim(), field[1].trim()] as [string, string])
    .filter((field) => field[0].length > 0 && field[1].length > 0)

  const encrypted = await encryptRecordClient({
    key: secret,
    data: input.data,
    metadata: metadata.length > 0 ? metadata : undefined,
  })

  return {
    name: input.name,
    type: input.type,
    tags: input.tags,
    data: encrypted.data ?? undefined,
    metadata: encrypted.metadata ?? undefined,
  }
}
