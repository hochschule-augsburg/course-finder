import type { Attachment } from 'nodemailer/lib/mailer'

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'smtp.hs-augsburg.de',
  port: 25,
  secure: false, // will still use STARTTLS if the server supports it
})

export async function sendEmail(
  to: string | string[],
  subject: string,
  text: string,
  attachments?: Attachment[],
) {
  const info = await transporter.sendMail({
    attachments,
    from: 'subject-enroll@hs-augsburg.de',
    subject,
    text,
    to,
  })
  return info
}
