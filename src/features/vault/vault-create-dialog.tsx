'use client'

import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import { Input } from '@/components/ui/input'
import { queryClient } from '@/lib/query-client'
import { createVaultAction } from '@/server/vault/vault'
import { useAuthStore } from '@/store/use-auth-store'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode, useRef, useState } from 'react'
import { toast } from 'sonner'

type VaultCreateDialogProps = {
  trigger: ReactNode
}

type VaultCreateDialogContentProps = {
  onOpenChange: (open: boolean) => void
}

export function VaultCreateDialog({ trigger }: VaultCreateDialogProps) {
  const [open, setOpen] = useState(false)

  return (
    <BetterDialog
      open={open}
      onOpenChange={setOpen}
      trigger={trigger}
      width="32rem"
    >
      <VaultCreateDialogContent onOpenChange={setOpen} />
    </BetterDialog>
  )
}

function VaultCreateDialogContent({
  onOpenChange,
}: VaultCreateDialogContentProps) {
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()
  const setVaultAuth = useAuthStore((state) => state.setVaultAuth)
  const [auth, setAuth] = useState('')
  const [icon, setIcon] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const createVaultMutation = useMutation({
    mutationFn: createVaultAction,
    onSuccess: async (result, variables) => {
      onOpenChange(false)
      setVaultAuth(result.vault.id, variables.auth)

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['vaults'] }),
        queryClient.invalidateQueries({ queryKey: ['vault'] }),
      ])

      toast.success('Vault created.')
      router.push(`/vault/${result.vault.id}`)
    },
  })

  return (
    <BetterDialogContent
      title="Create a new vault"
      description="Set up the vault details and start adding records."
      footerCancel
      footerSubmit="Create vault"
      footerSubmitIcon={<HugeiconsIcon icon={Add01Icon} className="size-4" />}
      footerSubmitLoading={createVaultMutation.isPending}
      onFooterSubmitClick={() => formRef.current?.requestSubmit()}
    >
      <form
        ref={formRef}
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()

          createVaultMutation.mutate(
            {
              auth,
              icon,
              name,
            },
            {
              onError: (mutationError) => {
                setError(
                  mutationError instanceof Error
                    ? mutationError.message
                    : 'Could not create the vault.'
                )
              },
            }
          )
        }}
      >
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="vault-name">
            Vault name
          </label>
          <Input
            id="vault-name"
            placeholder="Engineering Secrets"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="vault-auth">
            Vault PIN
          </label>
          <Input
            id="vault-auth"
            type="password"
            placeholder="Enter a vault PIN"
            value={auth}
            onChange={(event) => setAuth(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="vault-icon">
            Icon
          </label>
          <Input
            id="vault-icon"
            placeholder="Optional emoji or short label"
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
          />
        </div>

        {error && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
            {error}
          </div>
        )}
      </form>
    </BetterDialogContent>
  )
}
