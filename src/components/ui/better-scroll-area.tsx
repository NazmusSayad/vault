import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'
import { ScrollArea } from './scroll-area'

export function BetterScrollAreaProvider({
  children,
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div {...props} className={cn('relative size-full', className)}>
      {children}
    </div>
  )
}

export function BetterScrollAreaContent({
  ...props
}: React.ComponentProps<typeof ScrollArea>) {
  return (
    <ScrollArea
      {...props}
      style={{
        ...props?.style,
        inset: '0 !important',
        position: 'absolute' as const,
        width: '100%',
        height: '100%',
      }}
    />
  )
}

export function BetterScrollAreaFaded({
  children,
  fadeSpace = '2rem',
}: PropsWithChildren<{ fadeSpace?: number | string }>) {
  const resolvedFadeSpace =
    typeof fadeSpace === 'number' ? `${fadeSpace}px` : fadeSpace

  return (
    <BetterScrollAreaProvider>
      <BetterScrollAreaContent
        style={{
          maskImage: `linear-gradient(to bottom, transparent 0, black ${resolvedFadeSpace}, black calc(100% - ${resolvedFadeSpace}), transparent 100%)`,
        }}
      >
        {children}
      </BetterScrollAreaContent>
    </BetterScrollAreaProvider>
  )
}
