import 'dotenv/config'

import { defineConfig } from 'prisma/config'
import { serverEnv } from './src/env.server'

export default defineConfig({
  schema: './src/schema.prisma',
  migrations: { path: './src/server/.db' },
  datasource: {
    url: serverEnv.DATABASE_URL,
  },
})
