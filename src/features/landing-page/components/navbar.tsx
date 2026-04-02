'use client'

import { Button } from '@/components/ui/button'
import { Wrapper } from '@/components/wrapper'
import { GithubIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

export function Navbar() {
  return (
    <nav className="border-border bg-background/80 fixed top-0 z-50 w-full border-b backdrop-blur-sm">
      <Wrapper className="flex h-14 items-center justify-between">
        <Link href="/" className="text-foreground font-semibold tracking-tight">
          Keyvoid
        </Link>

        <div className="flex items-center gap-5">
          <a
            href="https://github.com/NazmusSayad/keyvoid"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={GithubIcon} className="size-4" />
          </a>

          <Button asChild variant="ghost" size="sm">
            <Link href="/auth">Sign in</Link>
          </Button>

          <Button asChild size="sm">
            <Link href="/vault">Open Vault</Link>
          </Button>
        </div>
      </Wrapper>
    </nav>
  )
}
