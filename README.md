# KeyVoid

End-to-end encrypted vault for your secrets. Zero-knowledge architecture — we cannot access your data.

## Features

- **Zero-Knowledge** — We cannot decrypt your data. Everything encrypts in your browser.
- **AES-256-GCM** — Military-grade encryption standard.
- **Multiple Vaults** — Organize secrets into separate vaults.
- **No Tracking** — No analytics, no cookies, no telemetry.

## Tech Stack

- Next.js 16 + React 19
- Tailwind CSS 4
- Prisma + PostgreSQL
- Hugeicons

## Quick Start

```bash
git clone https://github.com/NazmusSayad/keyvoid.git
cd keyvoid
pnpm install
```

Create `.env.local`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/keyvoid"
JWT_SESSION_SECRET="your-32-char-session-secret"
JWT_REGISTER_SECRET="your-register-jwt-secret"
JWT_RESET_PASSWORD_SECRET="your-reset-password-jwt-secret"
VAULT_HASH_KEY="your-32-byte-encryption-key"
VAULT_ENCRYPTION_KEY="your-32-byte-encryption-key"
```

Initialize and run:

```bash
pnpm run db:init
pnpm run build:icons
pnpm dev
```

## Scripts

- `pnpm dev` — Start dev server
- `pnpm build` — Build for production
- `pnpm db:init` — Initialize database
- `pnpm lint` — Run linter
- `pnpm test` — Run tests

## License

MIT
