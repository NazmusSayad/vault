export function Wrapper({
  className,
  maxWidth,
  padding,
  ...props
}: React.ComponentProps<'div'> & { maxWidth?: string; padding?: string }) {
  return (
    <div
      className={`mx-auto w-full max-w-[min(var(--max-width,72rem),calc(100%-(var(--padding,4%)*2)))] ${typeof className === 'string' ? className : ''}`}
      style={{
        ...(maxWidth && { '--max-width': maxWidth }),
        ...(padding && { '--padding': padding }),
        ...props.style,
      }}
      {...props}
    />
  )
}
