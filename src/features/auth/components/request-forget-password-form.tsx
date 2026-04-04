'use client'

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
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const requestForgetPasswordFormSchema = z.object({
  email: z.email('Enter a valid email address.'),
})

type RequestForgetPasswordFormData = z.infer<
  typeof requestForgetPasswordFormSchema
>

export function RequestForgetPasswordForm({
  defaultData,
  onSubmit,
}: {
  defaultData: Partial<RequestForgetPasswordFormData>
  onSubmit: (data: RequestForgetPasswordFormData) => Promise<void> | void
}) {
  const form = useForm({
    defaultValues: {
      email: defaultData.email ?? '',
    },
    resolver: zodResolver(requestForgetPasswordFormSchema),
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="text"
                  placeholder="name@company.com"
                  disabled={form.formState.isSubmitting}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          Continue
          {form.formState.isSubmitting && <Spinner />}
        </Button>
      </form>
    </Form>
  )
}
