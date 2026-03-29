import { Button } from '@/components/ui/button'
import { ArrowRight01Icon, GithubIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-foreground text-4xl font-bold tracking-tight sm:text-6xl">
            Secure, organized, and accessible data vault.
          </h1>
          <p className="text-muted-foreground mt-6 text-lg leading-8">
            A minimalist workspace for your private data. Store documents,
            links, and snippets with end-to-end encryption. No clutter, just the
            essentials.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button asChild size="lg">
              <Link href="/vault">
                Go to Vault
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="ml-2 size-4"
                />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <a
                href="https://github.com/sayad"
                target="_blank"
                rel="noreferrer"
              >
                <HugeiconsIcon icon={GithubIcon} className="mr-2 size-4" />
                View on GitHub
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
