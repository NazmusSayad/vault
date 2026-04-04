'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Delete02Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useState, type ComponentProps } from 'react'

type TagInputProps = Omit<ComponentProps<'input'>, 'value' | 'onChange'> & {
  value: string[]
  onChange: (value: string[]) => void
}

function toUniqueTags(current: string[], incoming: string[]) {
  const map = new Set(current.map((tag) => tag.toLowerCase()))
  const next: string[] = []

  incoming.forEach((tag) => {
    const trimmed = tag.trim()

    if (!trimmed) {
      return
    }

    const normalized = trimmed.toLowerCase()

    if (map.has(normalized)) {
      return
    }

    map.add(normalized)
    next.push(trimmed)
  })

  return next
}

function TagInput({
  className,
  value,
  onChange,
  onBlur,
  onKeyDown,
  onPaste,
  disabled,
  ...props
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  function addTags(tags: string[]) {
    const next = toUniqueTags(value, tags)

    if (next.length === 0) {
      return
    }

    onChange([...value, ...next])
  }

  function commitInputValue() {
    if (!inputValue.trim()) {
      return
    }

    addTags(inputValue.split(/[\n,]+/g))
    setInputValue('')
  }

  return (
    <div
      data-slot="tag-input"
      className={cn(
        'border-input focus-within:border-ring focus-within:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive flex min-h-9 w-full flex-wrap items-center gap-1.5 rounded-md border bg-transparent px-2 py-1.5 text-sm transition-[color,box-shadow] focus-within:ring-[3px] has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50',
        className
      )}
    >
      {value.map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="gap-1 rounded-sm pr-1 pl-2"
        >
          <span>{tag}</span>

          <button
            type="button"
            className="hover:bg-secondary-foreground/10 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex size-4 items-center justify-center rounded-xs outline-none focus-visible:ring-[3px]"
            onClick={() => onChange(value.filter((item) => item !== tag))}
            disabled={disabled}
          >
            <HugeiconsIcon icon={Delete02Icon} className="size-3" />
            <span className="sr-only">Remove {tag}</span>
          </button>
        </Badge>
      ))}

      <input
        {...props}
        disabled={disabled}
        value={inputValue}
        onChange={(event) => setInputValue(event.target.value)}
        onKeyDown={(event) => {
          onKeyDown?.(event)

          if (event.defaultPrevented) {
            return
          }

          if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault()
            commitInputValue()
          }

          if (
            event.key === 'Backspace' &&
            !inputValue.trim() &&
            value.length > 0
          ) {
            event.preventDefault()
            onChange(value.slice(0, -1))
          }
        }}
        onPaste={(event) => {
          onPaste?.(event)

          if (event.defaultPrevented) {
            return
          }

          const pasted = event.clipboardData.getData('text')

          if (!/[,\n]/.test(pasted)) {
            return
          }

          event.preventDefault()
          addTags(pasted.split(/[\n,]+/g))
          setInputValue('')
        }}
        onBlur={(event) => {
          commitInputValue()
          onBlur?.(event)
        }}
        className="placeholder:text-muted-foreground min-w-28 flex-1 bg-transparent px-1 py-0.5 outline-none"
      />
    </div>
  )
}

export { TagInput }
