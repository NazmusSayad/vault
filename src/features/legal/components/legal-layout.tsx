'use client'

import { Logo } from '@/components/brand/logo'
import { Wrapper } from '@/components/wrapper'
import Link from 'next/link'
import { PropsWithChildren } from 'react'

interface LegalLayoutProps extends PropsWithChildren {
  title: string
  lastUpdated: string
}

export function LegalLayout({
  children,
  title,
  lastUpdated,
}: LegalLayoutProps) {
  return (
    <div className="bg-background min-h-screen">
      <header className="border-border border-b">
        <Wrapper className="flex h-14 items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm font-medium tracking-tight"
          >
            <Logo className="-mt-[2.5px] size-6" />
            <span className="font-mono text-xl">KeyVoid</span>
          </Link>
          <span className="text-muted-foreground font-mono text-xs">
            {title}
          </span>
        </Wrapper>
      </header>

      <main className="py-12">
        <Wrapper className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-foreground text-3xl font-bold">{title}</h1>
            <p className="text-muted-foreground mt-2 font-mono text-xs">
              Last updated: {lastUpdated}
            </p>
          </div>

          <div className="prose prose-sm prose-slate max-w-none">
            {children}
          </div>
        </Wrapper>
      </main>

      <footer className="border-border border-t py-6">
        <Wrapper className="flex items-center justify-between">
          <span className="text-muted-foreground font-mono text-xs">
            &copy; {new Date().getFullYear()} KeyVoid
          </span>
          <div className="flex items-center gap-4">
            <Link
              href="/legal/privacy"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/legal/terms"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Home
            </Link>
          </div>
        </Wrapper>
      </footer>
    </div>
  )
}
