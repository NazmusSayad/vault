# KeyVoid

End-to-end encrypted vault for your secrets. Zero-knowledge architecture ensures only you can access your data.

![Version](https://img.shields.io/badge/version-2.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Features

- **Zero-Knowledge Architecture** — We cannot decrypt your data. Ever. Everything is encrypted in your browser before it reaches our servers.
- **AES-256-GCM Encryption** — Military-grade encryption standard used by governments and banks worldwide.
- **Self-Destructing Links** — Share secrets with one-time links that automatically expire after viewing.
- **Multiple Vaults** — Organize secrets into separate vaults (work, personal, finance) — all isolated and encrypted.
- **Cross-Device Access** — Access from anywhere. Your vault syncs securely across all your devices.
- **Double Encryption** — Client-side encryption in browser, then server-side encryption at rest.
- **No Tracking** — No analytics, no cookies, no telemetry. Your usage is yours alone.

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 with App Router
- **UI Library:** [React](https://react.dev/) 19
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) 4
- **Components:** [Radix UI](https://www.radix-ui.com/) primitives
- **Icons:** [Hugeicons](https://hugeicons.com/)
- **Database:** PostgreSQL with [Prisma](https://www.prisma.io/) ORM
- **Authentication:** JWT-based with [Jose](https://github.com/panva/jose)
- **Animation:** [Framer Motion](https://www.framer.com/motion/)
- **Testing:** [Vitest](https://vitest.dev/)

## Prerequisites

- Node.js 20+
- PostgreSQL database
- pnpm (recommended) or npm

## Installation

1. Clone the repository:

```bash
git clone https://github.com/NazmusSayad/keyvoid.git
cd keyvoid
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/keyvoid"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"

# Email (for password reset)
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="your-email@example.com"
SMTP_PASS="your-app-password"
```

4. Initialize the database:

```bash
pnpm run db:init
```

5. Build the icons:

```bash
pnpm run build:icons
```

## Development

Start the development server:

```bash
pnpm dev
```

The app will be available at `http://localhost:3000`.

### Available Scripts

| Command            | Description                                |
| ------------------ | ------------------------------------------ |
| `pnpm dev`         | Start development server with hot reload   |
| `pnpm build`       | Build for production                       |
| `pnpm start`       | Start production server                    |
| `pnpm db:init`     | Initialize database with Prisma            |
| `pnpm db:studio`   | Open Prisma Studio for database management |
| `pnpm build:icons` | Build icon components from Hugeicons       |
| `pnpm lint`        | Run ESLint and TypeScript checks           |
| `pnpm lint:fix`    | Fix ESLint issues automatically            |
| `pnpm test`        | Run tests with Vitest                      |
| `pnpm test:watch`  | Run tests in watch mode                    |

## Project Structure

```
keyvoid/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (private)/          # Protected routes (requires auth)
│   │   │   ├── account/        # Account settings
│   │   │   ├── home/           # Dashboard home
│   │   │   └── vault/          # Vault management
│   │   ├── auth/               # Authentication pages
│   │   │   ├── forgot-password/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── legal/              # Legal pages
│   │   │   ├── privacy/        # Privacy Policy
│   │   │   └── terms/          # Terms of Service
│   │   ├── layout.tsx          # Root layout
│   │   ├── loading.tsx         # Global loading state
│   │   ├── not-found.tsx       # 404 page
│   │   └── page.tsx            # Landing page
│   ├── components/             # Shared UI components
│   │   ├── brand/              # Logo and brand assets
│   │   └── ui/                 # Reusable UI primitives
│   ├── features/               # Feature-based modules
│   │   ├── account/            # Account management feature
│   │   ├── auth/               # Authentication feature
│   │   ├── landing-page/       # Landing page feature
│   │   ├── legal/              # Legal pages feature
│   │   └── vault/              # Vault feature
│   ├── lib/                    # Utility libraries
│   │   ├── providers.tsx       # React context providers
│   │   └── utils.ts            # Helper utilities
│   ├── store/                  # Zustand state stores
│   ├── styles/                 # Global styles
│   └── types/                  # TypeScript types
├── prisma/                     # Prisma schema and migrations
├── public/                     # Static assets
└── package.json
```

## Environment Variables

| Variable       | Description                               | Required |
| -------------- | ----------------------------------------- | -------- |
| `DATABASE_URL` | PostgreSQL connection string              | Yes      |
| `JWT_SECRET`   | Secret key for JWT signing (min 32 chars) | Yes      |
| `SMTP_HOST`    | SMTP server host                          | No       |
| `SMTP_PORT`    | SMTP server port                          | No       |
| `SMTP_USER`    | SMTP username                             | No       |
| `SMTP_PASS`    | SMTP password                             | No       |

## Security

- All encryption happens client-side in the browser
- Master password never leaves your device
- Server only stores encrypted data
- Double encryption layers (client + server)
- One-time JWT tokens for password reset
- CSRF protection on all forms

## Self-Hosting

KeyVoid is designed to be easily self-hosted:

1. Deploy to Vercel, Railway, or your preferred platform
2. Set up a PostgreSQL database
3. Configure environment variables
4. Run `pnpm run db:init` to initialize

## License

MIT License — see [LICENSE](./LICENSE) for details.

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## Support

For issues and feature requests, please use the [GitHub Issues](https://github.com/NazmusSayad/keyvoid/issues) page.

---

Built with security in mind. Your keys, your data, your control.
