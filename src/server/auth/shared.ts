import 'server-only'

import { serverEnv } from '@/env.server'

export function getAbsoluteUrl(pathname = '/') {
  return new URL(pathname, serverEnv.APP_URL)
}
