import 'dotenv/config'

import { defineConfig } from 'prisma/config'
import { serverEnv } from './src/env.server'

export default defineConfig({
  schema: './src/db.prisma',
  migrations: { path: './src/server/db/.prisma' },
  datasource: {
    url: serverEnv.DATABASE_URL,
  },
})
