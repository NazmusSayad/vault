import { serverEnv } from '@/env.server'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  auth: {
    pass: serverEnv.GMAIL_PASSWORD,
    user: serverEnv.GMAIL_ADDRESS,
  },
  service: 'gmail',
})

export async function sendOtpEmail(data: {
  description: string
  email: string
  otp: string
  subject: string
}) {
  await transporter.sendMail({
    from: `"KeyVoid" <${serverEnv.GMAIL_ADDRESS}>`,
    html: `
      <div style="font-family: Arial, sans-serif; margin: 0 auto; max-width: 560px; padding: 24px; color: #111827;">
        <p style="margin: 0 0 12px; font-size: 14px; letter-spacing: 0.08em; text-transform: uppercase; color: #6b7280;">KeyVoid verification</p>
        <h1 style="margin: 0 0 12px; font-size: 28px; line-height: 1.2;">Your one-time code</h1>
        <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.6; color: #374151;">${data.description}</p>
        <div style="margin: 0 0 20px; border-radius: 20px; background: #f3f4f6; padding: 20px; text-align: center;">
          <span style="font-size: 32px; font-weight: 700; letter-spacing: 0.32em; color: #111827;">${data.otp}</span>
        </div>
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #6b7280;">This code expires in 10 minutes. If you did not request it, you can ignore this email.</p>
      </div>
    `,
    subject: data.subject,
    text: `${data.description}\n\nYour KeyVoid code: ${data.otp}\n\nThis code expires in 10 minutes.`,
    to: data.email,
  })
}
