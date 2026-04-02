'use client'

import { Button } from '@/components/ui/button'
import { Wrapper } from '@/components/wrapper'
import {
  ArrowRight01Icon,
  Database01Icon,
  EyeIcon,
  GithubIcon,
  Key01Icon,
  LockIcon,
  ShieldKeyIcon,
  WifiCircleIcon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'

const features = [
  {
    icon: EyeIcon,
    title: 'Zero Knowledge',
    description:
      'Your data is encrypted before it ever reaches our servers. We cannot see, read, or access your information under any circumstances.',
  },
  {
    icon: LockIcon,
    title: 'End-to-End Encryption',
    description:
      '256-bit encryption protects every document, link, and snippet. Only you hold the keys.',
  },
  {
    icon: Database01Icon,
    title: 'Organized Vaults',
    description:
      'Create multiple vaults to separate and categorize your sensitive data.',
  },
  {
    icon: WifiCircleIcon,
    title: 'Access Anywhere',
    description:
      'Your vault follows you on every device. Secure and always in sync.',
  },
  {
    icon: ShieldKeyIcon,
    title: 'Self-Destructing Links',
    description:
      'Share sensitive information with one-time links that vanish after viewing.',
  },
  {
    icon: Key01Icon,
    title: 'Fast',
    description:
      'Encryption and decryption happen instantly. No lag, no waiting.',
  },
]

export function Hero() {
  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-24">
        <Wrapper className="">
          <div className="max-w-2xl">
            <h1 className="text-foreground text-4xl leading-tight font-bold tracking-tight sm:text-5xl">
              Encrypted vault for
              <br />
              your private data
            </h1>

            <p className="text-muted-foreground mt-6 max-w-lg text-base leading-relaxed">
              Store documents, links, passwords, and notes with zero-knowledge
              encryption. Only you can access your data. Always.
            </p>

            <div className="mt-8 flex items-center gap-3">
              <Button asChild>
                <Link href="/vault">
                  Open Vault
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="ml-1.5 size-4"
                  />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/auth">Sign in</Link>
              </Button>
            </div>
          </div>
        </Wrapper>
      </section>

      <section className="border-border border-t py-20">
        <Wrapper className="">
          <div>
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Features
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
              Built to keep your data safe and accessible. Nothing more, nothing
              less.
            </p>
          </div>

          <div className="divide-border mt-12 flex flex-col divide-y">
            {features.map((f) => (
              <div
                key={f.title}
                className="group flex items-start gap-5 py-6 first:pt-0"
              >
                <HugeiconsIcon
                  icon={f.icon}
                  className="text-muted-foreground mt-0.5 size-5 shrink-0"
                />
                <div>
                  <h3 className="text-foreground text-sm font-semibold">
                    {f.title}
                  </h3>
                  <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                    {f.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Wrapper>
      </section>

      <section className="border-border border-t py-20">
        <Wrapper className="">
          <div className="max-w-lg">
            <h2 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
              Start using Keyvoid
            </h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              No credit card. No tracking. Open source and ready to self-host.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <Button asChild>
                <Link href="/vault">
                  Get Started
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="ml-1.5 size-4"
                  />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <a
                  href="https://github.com/NazmusSayad/keyvoid"
                  target="_blank"
                  rel="noreferrer"
                >
                  <HugeiconsIcon icon={GithubIcon} className="mr-1.5 size-4" />
                  GitHub
                </a>
              </Button>
            </div>
          </div>
        </Wrapper>
      </section>

      <footer className="border-border border-t py-8">
        <Wrapper className="flex items-center justify-between px-5">
          <span className="text-muted-foreground text-xs">
            &copy; {new Date().getFullYear()} Keyvoid
          </span>
          <a
            href="https://github.com/NazmusSayad/keyvoid"
            target="_blank"
            rel="noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <HugeiconsIcon icon={GithubIcon} className="size-4" />
          </a>
        </Wrapper>
      </footer>
    </div>
  )
}
