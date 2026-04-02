import { useAuthStore } from '@/store/use-auth-store'
import { ComponentProps } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

export function UserAvatar({ ...props }: ComponentProps<typeof Avatar>) {
  const user = useAuthStore((state) => state.user)
  const fallback =
    user?.name
      ?.trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.slice(0, 1))
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'AC'

  return (
    <Avatar {...props}>
      <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  )
}
