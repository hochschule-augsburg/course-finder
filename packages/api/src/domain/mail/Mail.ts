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
  attachmentName?: string,
  attachmentContent?: string,
) {
  const info = await transporter.sendMail({
    attachments: [{ content: attachmentContent, filename: attachmentName }],
    from: 'subject-enroll@hs-augsburg.de',
    subject,
    text,
    to,
  })
  return info
}

// const info = await sendEmail(
//   'nicolas.bota@tha.de',
//   'head of my test',
//   'body of my test',
//   'testAttachment.txt',
//   'test attachment content',
// )

// console.log(info)
