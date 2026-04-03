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
  fields: RecordTypeDetailsField[]
}

export const RECORD_TYPES: RecordTypeDetails[] = [
  {
    id: 'password',
    name: 'Password',
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
