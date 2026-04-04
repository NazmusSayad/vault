import {
  ApiIcon,
  LoginMethodIcon,
  Note05Icon,
} from '@hugeicons/core-free-icons'
import { IconSvgElement } from '@hugeicons/react'

export const FIELD_INPUT_TYPES = [
  'text',
  'textarea',
  'number',
  'boolean',
] as const

export type FieldInputType = (typeof FIELD_INPUT_TYPES)[number]

export type RecordTypeDetailsField = {
  id: string
  name: string
  type: FieldInputType
  required?: boolean
}

export type RecordTypeDetails = {
  id: string
  name: string
  icon: IconSvgElement
  fields: RecordTypeDetailsField[]
}

export const RECORD_TYPES: RecordTypeDetails[] = [
  {
    id: 'password',
    name: 'Password',
    icon: LoginMethodIcon,
    fields: [
      {
        id: 'username',
        name: 'Username',
        type: 'text',
      },
      {
        id: 'email',
        name: 'Email',
        type: 'text',
      },
      {
        id: 'password',
        name: 'Password',
        type: 'text',
        required: true,
      },
    ],
  },

  {
    id: 'NOTE',
    name: 'Note',
    icon: Note05Icon,
    fields: [
      {
        id: 'content',
        name: 'Content',
        type: 'textarea',
        required: true,
      },
    ],
  },

  {
    id: 'apiKey',
    name: 'API Key',
    icon: ApiIcon,
    fields: [
      {
        id: 'key',
        name: 'Key',
        type: 'text',
        required: true,
      },
      {
        id: 'description',
        name: 'Description',
        type: 'textarea',
      },
    ],
  },
]

export function resolveRecordIcon(
  type: string | undefined | null,
  fallbackIcon: IconSvgElement = LoginMethodIcon
) {
  return (
    RECORD_TYPES.find((recordType) => recordType.id === type)?.icon ||
    fallbackIcon
  )
}
