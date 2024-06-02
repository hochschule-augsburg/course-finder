import type { Attachment } from 'nodemailer/lib/mailer'

import nodemailer from 'nodemailer'

export async function sendEmail(
  to: string | string[],
  subject: string,
  text: string,
  attachments?: Attachment[],
) {
  if (!process.env.MAIL_SENDER_PASSWORD || !process.env.MAIL_SENDER_USERNAME) {
    throw new Error(
      'MAIL_SENDER_USERNAME and MAIL_SENDER_PASSWORD enviroment variables must be set.',
    )
  }

  const transporter = nodemailer.createTransport({
    auth: {
      pass: process.env.MAIL_SENDER_PASSWORD,
      user: process.env.MAIL_SENDER_USERNAME,
    },
    host: 'smtp.hs-augsburg.de',
    port: 25,
    secure: false, // will still use STARTTLS if the host supports it
  })

  const info = await transporter.sendMail({
    attachments,
    from: 'subject-enroll@tha.de',
    subject,
    text,
    to,
  })
  return info
}
