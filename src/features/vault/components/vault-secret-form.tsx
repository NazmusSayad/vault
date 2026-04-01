import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { queryClient } from '@/lib/query-client'
import { getVaultRecordsAction } from '@/server/vault/vault'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type VaultSecretFormProps = {
  vaultId: string
  confirmSecret: (secret: string) => void
}

const vaultSecretFormSchema = z.object({
  pin: z.string().trim().min(1, 'Enter a vault PIN.'),
})

export function VaultSecretForm({
  vaultId,
  confirmSecret,
}: VaultSecretFormProps) {
  const [error, setError] = useState('')
  const form = useForm({
    defaultValues: {
      pin: '',
    },
    resolver: zodResolver(vaultSecretFormSchema),
  })

  const confirmSecretMutation = useMutation({
    mutationFn: async ({ pin }: { pin: string }) => {
      const data = await getVaultRecordsAction({ auth: pin, vaultId })

      return { data, pin }
    },

    onSuccess: ({ data, pin }) => {
      setError('')

      queryClient.setQueryData(['vault', vaultId], data)
      confirmSecret(pin)
    },
  })

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit((values) => {
          setError('')
          confirmSecretMutation.mutate(
            {
              pin: values.pin,
            },
            {
              onError: (mutationError) => {
                setError(
                  mutationError instanceof Error
                    ? mutationError.message
                    : 'Could not unlock this vault.'
                )
              },
            }
          )
        })}
      >
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vault PIN</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="password"
                  placeholder="Enter a vault PIN"
                  autoComplete="current-password"
                  disabled={confirmSecretMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {error && (
          <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-2xl border px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={confirmSecretMutation.isPending}
        >
          {confirmSecretMutation.isPending ? (
            <Spinner className="size-4" />
          ) : null}
          Confirm PIN
        </Button>
      </form>
    </Form>
  )
}
