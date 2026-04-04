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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp'
import { Spinner } from '@/components/ui/spinner'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

const confirmRegisterFormSchema = z.object({
  otp: z.string().length(6, 'Enter the six-digit code.'),
})

type ConfirmRegisterFormData = z.infer<typeof confirmRegisterFormSchema>

export function ConfirmRegisterForm({
  defaultData,
  onSubmit,
}: {
  defaultData: Partial<ConfirmRegisterFormData>
  onSubmit: (data: ConfirmRegisterFormData) => Promise<void> | void
}) {
  const form = useForm({
    defaultValues: {
      otp: defaultData.otp ?? '',
    },
    resolver: zodResolver(confirmRegisterFormSchema),
  })

  const otp = form.watch('otp')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Verification code</FormLabel>
              <FormControl>
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={form.formState.isSubmitting}
                  containerClassName="w-full justify-center gap-2"
                >
                  <InputOTPGroup className="gap-2">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <InputOTPSlot
                        key={index}
                        index={index}
                        className="bg-background border-input h-12 w-12 rounded-lg border text-lg"
                      />
                    ))}
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting || otp.length !== 6}
        >
          Create account
          {form.formState.isSubmitting && <Spinner />}
        </Button>
      </form>
    </Form>
  )
}
