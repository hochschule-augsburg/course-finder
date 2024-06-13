import type { Attachment } from 'nodemailer/lib/mailer'

import nodemailer from 'nodemailer'

export async function sendEmail(
  to: string | string[],
  subject: string,
  text: string,
  attachments?: Attachment[],
) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hs-augsburg.de',
    port: 25,
    secure: false, // will still use STARTTLS if the host supports it
  })

  const info = await transporter.sendMail({
    attachments,
    from: 'course-finder@tha.de',
    subject,
    text,
    to,
  })
  return info
}
