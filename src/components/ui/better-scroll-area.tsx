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

export function BetterScrollArea({ children }: PropsWithChildren) {
  return (
    <BetterScrollAreaProvider>
      <BetterScrollAreaContent>{children}</BetterScrollAreaContent>
    </BetterScrollAreaProvider>
  )
}
