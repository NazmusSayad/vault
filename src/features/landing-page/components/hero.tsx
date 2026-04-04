'use client'

import { Button } from '@/components/ui/button'
import { Wrapper } from '@/components/wrapper'
import {
  ArrowRight01Icon,
  Database01Icon,
  EyeIcon,
  FingerPrintIcon,
  GithubIcon,
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
    desc: 'We cannot decrypt your data. Ever. Everything is encrypted in your browser before it reaches our servers.',
  },
  {
    icon: LockIcon,
    title: 'AES-256-GCM',
    desc: 'Military-grade encryption. The same standard used by governments and banks worldwide.',
  },
  {
    icon: ShieldKeyIcon,
    title: 'Self-Destructing Links',
    desc: 'Share secrets with one-time links that automatically expire after viewing. No traces left.',
  },
  {
    icon: Database01Icon,
    title: 'Multiple Vaults',
    desc: 'Organize secrets into separate vaults. Work, personal, finance — all isolated and encrypted.',
  },
  {
    icon: WifiCircleIcon,
    title: 'Cross-Device',
    desc: 'Access from anywhere. Your vault syncs securely across all your devices.',
  },
  {
    icon: FingerPrintIcon,
    title: 'No Tracking',
    desc: 'No analytics, no cookies, no telemetry. Your usage is yours alone.',
  },
]

export function Hero() {
  return (
    <div className="min-h-screen">
      <section className="relative pt-32 pb-24">
        <Wrapper>
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col items-center justify-center text-center lg:items-start lg:text-left">
              <div className="mb-6 inline-flex">
                <span className="bg-primary/10 text-primary border-primary/20 rounded-none border px-2 py-1 font-mono text-xs">
                  v2.0 — now self-hostable
                </span>
              </div>

              <h1 className="text-foreground text-5xl leading-[0.95] font-bold tracking-tight sm:text-6xl lg:text-7xl">
                Encrypted
                <br />
                <span className="text-primary">vault</span>
              </h1>

              <p className="text-muted-foreground mt-6 max-w-sm text-base leading-relaxed">
                Zero-knowledge storage for passwords, documents, and secrets.
                You hold the keys. We hold nothing.
              </p>

              <div className="mt-8 flex items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/vault">
                    open vault
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="ml-2 size-4"
                    />
                  </Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <a
                    href="https://github.com/NazmusSayad/keyvoid"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <HugeiconsIcon icon={GithubIcon} className="size-4" />
                    source
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative flex items-center justify-center lg:justify-end">
              <VaultVisual />
            </div>
          </div>
        </Wrapper>
      </section>

      <section className="border-border border-t py-24">
        <Wrapper>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 className="text-foreground text-2xl font-bold">
                How it works
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Three steps. No complexity.
              </p>
            </div>

            <div className="lg:col-span-8">
              <div className="grid gap-8 sm:grid-cols-3">
                {[
                  {
                    num: '01',
                    title: 'Create',
                    desc: 'Generate your vault with a master password only you know.',
                  },
                  {
                    num: '02',
                    title: 'Encrypt',
                    desc: 'Add secrets. Everything encrypts in your browser before sending.',
                  },
                  {
                    num: '03',
                    title: 'Access',
                    desc: 'Retrieve from anywhere. Decryption happens client-side.',
                  },
                ].map((step) => (
                  <div key={step.num} className="relative">
                    <span className="text-primary font-mono text-3xl font-bold">
                      {step.num}
                    </span>
                    <h3 className="text-foreground mt-4 text-sm font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mt-1 text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Wrapper>
      </section>

      <section className="border-border border-t py-24">
        <Wrapper>
          <div className="mb-12">
            <h2 className="text-foreground text-2xl font-bold">Features</h2>
            <p className="text-muted-foreground mt-2 max-w-md text-sm">
              Everything you need to keep your secrets safe. Nothing you
              don&apos;t.
            </p>
          </div>

          <div className="bg-border grid gap-px sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="bg-background p-6">
                <HugeiconsIcon icon={f.icon} className="text-primary size-5" />
                <h3 className="text-foreground mt-4 text-sm font-semibold">
                  {f.title}
                </h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </Wrapper>
      </section>

      <section className="border-border border-t py-24">
        <Wrapper>
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="text-foreground text-2xl font-bold">
                Double encryption
              </h2>
              <p className="text-muted-foreground mt-2 max-w-md text-sm leading-relaxed">
                Your data is encrypted twice — once in your browser, then again
                on the server. Even if one layer is compromised, your secrets
                remain locked.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border-border bg-card border p-4">
                <div className="text-primary font-mono text-xs uppercase">
                  Layer 1 — Client
                </div>
                <p className="text-foreground mt-2 text-sm">
                  AES-256-GCM encryption happens in your browser using your
                  master password. The server never sees your unencrypted data
                  or your password.
                </p>
              </div>
              <div className="border-border bg-card border p-4">
                <div className="text-primary font-mono text-xs uppercase">
                  Layer 2 — Server
                </div>
                <p className="text-foreground mt-2 text-sm">
                  Already-encrypted data is encrypted again at rest using
                  server-side keys. Even database access won&apos;t expose your
                  secrets.
                </p>
              </div>
            </div>
          </div>
        </Wrapper>
      </section>

      <section className="border-border border-t py-24">
        <Wrapper>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Encryption', value: 'AES-256-GCM' },
              { label: 'Architecture', value: 'Zero-knowledge' },
              { label: 'License', value: 'MIT' },
              { label: 'Hosting', value: 'Self-hosted' },
            ].map((stat) => (
              <div key={stat.label} className="border-border border-l-2 pl-4">
                <div className="text-muted-foreground font-mono text-xs uppercase">
                  {stat.label}
                </div>
                <div className="text-foreground mt-1 text-lg font-semibold">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </Wrapper>
      </section>

      <section className="border-border border-t py-24">
        <Wrapper>
          <div className="flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-foreground text-3xl font-bold">
                Ready to secure your data?
              </h2>
              <p className="text-muted-foreground mt-2">
                Free forever. No credit card required.
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/vault">
                get started
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="ml-2 size-4"
                />
              </Link>
            </Button>
          </div>
        </Wrapper>
      </section>

      <footer className="border-border border-t py-6">
        <Wrapper className="flex items-center justify-between">
          <span className="text-muted-foreground font-mono text-xs">
            &copy; {new Date().getFullYear()}
          </span>
          <div className="flex items-center gap-4">
            <a
              href="/legal/privacy"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              privacy
            </a>
            <a
              href="/legal/terms"
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              terms
            </a>
          </div>
        </Wrapper>
      </footer>
    </div>
  )
}

function VaultVisual() {
  return (
    <div className="relative">
      <div className="border-border bg-card relative flex aspect-square w-64 items-center justify-center border sm:w-80">
        <div className="grid grid-cols-6 gap-1">
          {Array.from({ length: 36 }).map((_, i) => {
            const isActive = [
              2, 3, 4, 8, 11, 14, 17, 20, 23, 26, 29, 32, 33, 34,
            ].includes(i)
            return (
              <div
                key={i}
                className={`size-8 sm:size-10 ${isActive ? 'bg-primary' : 'bg-muted'}`}
              />
            )
          })}
        </div>
        <div className="border-border bg-background absolute -right-3 -bottom-3 border px-2 py-1">
          <span className="text-muted-foreground font-mono text-xs">
            256-bit
          </span>
        </div>
      </div>
      <div className="border-border bg-background absolute -top-3 -left-3 size-6 border" />
      <div className="border-border bg-background absolute -top-3 -right-3 size-6 border" />
    </div>
  )
}
