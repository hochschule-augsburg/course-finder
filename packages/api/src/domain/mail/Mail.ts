import sendmail from 'sendmail'

export function sendEmail(
  to: string,
  subject: string,
  text: string,
  attachmentName: string | undefined,
  attachmentContent: string | undefined,
) {
  return new Promise((resolve) =>
    sendmail({
      smtpHost: 'smtp.hs-augsburg.de',
      smtpPort: 25,
    })(
      {
        attachments: [{ content: attachmentContent, filename: attachmentName }],
        from: 'subject-enroll@hs-augsburg.de',
        subject,
        text,
        to,
      },
      resolve,
    ),
  )
}
