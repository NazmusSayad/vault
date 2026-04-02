'use client'

import { Button } from '@/components/ui/button'
import { Wrapper } from '@/components/wrapper'
import { GithubIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-border fixed top-0 z-50 w-full border-b">
      <Wrapper className="flex h-12 items-center justify-between">
        <Link href="/" className="font-mono text-sm font-medium tracking-tight">
          keyvoid
        </Link>

        <div className="flex items-center gap-1">
          <a
            href="https://github.com/NazmusSayad/keyvoid"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground p-2 transition-colors"
          >
            <HugeiconsIcon icon={GithubIcon} className="size-4" />
          </a>

          <Button asChild variant="ghost" size="sm">
            <Link href="/auth/login">sign in</Link>
          </Button>
        </div>
      </Wrapper>
    </nav>
  )
}
