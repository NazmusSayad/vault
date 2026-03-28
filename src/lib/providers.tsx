'use client'

import { queryClient } from '@/lib/query-client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from 'next-themes'
import { PropsWithChildren } from 'react'
import { Toaster } from 'sonner'

export function Providers({ children }: PropsWithChildren) {
  return (
    <ThemeProvider attribute="class" enableSystem>
      <QueryClientProvider client={queryClient}>
        {children}

        <Toaster
          richColors
          className="cursor-grab select-none active:cursor-grabbing"
        />
      </QueryClientProvider>
    </ThemeProvider>
  )
}
