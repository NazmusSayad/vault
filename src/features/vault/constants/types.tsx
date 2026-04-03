type RecordTypeDetails = {
  id: string
  name: string
  type: InputType
  fields: {
    id: string
    name: string
    type: InputType
    required?: boolean
  }[]
}

export const INPUT_TYPES = ['text', 'textarea', 'number', 'boolean'] as const
type InputType = (typeof INPUT_TYPES)[number]

export const RECORD_TYPES: RecordTypeDetails[] = [
  {
    id: 'password',
    name: 'Password',
    type: 'text',
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
    type: 'textarea',
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
    type: 'text',
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
