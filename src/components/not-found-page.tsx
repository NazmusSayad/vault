import Link from 'next/link'

export function NotFoundPage() {
  return (
    <div className="from-background to-secondary/40 flex min-h-screen flex-col items-center justify-center bg-gradient-to-br p-8 text-center">
      <h1 className="text-primary mb-4 text-7xl font-extrabold drop-shadow-lg">
        404
      </h1>
      <h2 className="text-foreground mb-2 text-2xl font-bold md:text-3xl">
        Page Not Found
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        Sorry, the page you are looking for does not exist or has been moved.
      </p>

      <Link
        href="/"
        className="bg-primary hover:bg-primary/90 text-primary-foreground inline-block rounded-lg px-6 py-3 font-semibold shadow transition-colors"
      >
        Go Home
      </Link>
    </div>
  )
}
