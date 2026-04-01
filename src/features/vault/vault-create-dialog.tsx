'use client'

import {
  BetterDialog,
  BetterDialogContent,
} from '@/components/ui/better-dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { queryClient } from '@/lib/query-client'
import { createVaultAction } from '@/server/vault/vault'
import { useAuthStore } from '@/store/use-auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { Add01Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { type ReactNode, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

type VaultCreateDialogProps = {
  trigger: ReactNode
}

type VaultCreateDialogContentProps = {
  onOpenChange: (open: boolean) => void
}

const vaultCreateFormSchema = z.object({
  auth: z.string().trim().min(1, 'Enter a vault PIN.'),
  icon: z.string().trim().optional(),
  name: z.string().trim().min(1, 'Enter a vault name.'),
})

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
  const form = useForm({
    defaultValues: {
      auth: '',
      icon: '',
      name: '',
    },
    resolver: zodResolver(vaultCreateFormSchema),
  })
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
      <Form {...form}>
        <form
          ref={formRef}
          className="space-y-4"
          onSubmit={form.handleSubmit((values) => {
            createVaultMutation.mutate(values, {
              onError: (mutationError) => {
                form.setError('root', {
                  message:
                    mutationError instanceof Error
                      ? mutationError.message
                      : 'Could not create the vault.',
                })
              },
            })
          })}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vault name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Engineering Secrets"
                    disabled={createVaultMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="auth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vault PIN</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Enter a vault PIN"
                    disabled={createVaultMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Optional emoji or short label"
                    disabled={createVaultMutation.isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {form.formState.errors.root?.message ? (
            <p>{form.formState.errors.root.message}</p>
          ) : null}
        </form>
      </Form>
    </BetterDialogContent>
  )
}
