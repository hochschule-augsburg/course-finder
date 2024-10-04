import type { Attachment } from 'nodemailer/lib/mailer'
import type SMTPTransport from 'nodemailer/lib/smtp-transport'

import nodemailer from 'nodemailer'

import { env } from '../../env.ts'

export async function sendEmail(
  to: string | string[],
  subject: string,
  htmlContent: string,
  attachments?: Attachment[],
): Promise<SMTPTransport.SentMessageInfo> {
  const transporter = nodemailer.createTransport({
    host: 'smtp.hs-augsburg.de',
    port: 25,
    secure: false, // will still use STARTTLS if the host supports it
  })

  const html = template
    .replace('{{SUBJECT}}', subject)
    .replace('{{CONTENT}}', htmlContent)

  // if (process.env.NODE_ENV === 'production') {
  const info = await transporter.sendMail({
    attachments,
    from: {
      address: 'no-reply@course-finder.informatik.tha.de',
      name: 'CourseFinder',
    },
    html,
    replyTo: env.CONTACT_EMAIL,
    subject: `⛵ ${subject} ⛵`,
    to,
  })
  return info
  // }
  return {
    accepted: [],
    envelope: { from: '', to: [] },
    messageId: '123',
    pending: [],
    rejected: [],
    response: 'Mocked',
  }
}

const template = `
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{SUBJECT}}</title>
    <style>
      body {
        font-family: Arial, Helvetica, sans-serif;
      }
      .inner-body {
        margin: 20px 10px;
        padding: 10px;
        box-sizing: border-box;
      }
      .header {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        padding-bottom: 8px;
        border-bottom: 2px solid #333;
      }
      .main {
        flex: 1;
        min-width: 250px;
        margin-bottom: 10px;
      }
      .name {
        font-size: 2.5em;
        color: #ff266d;
        margin: 0;
      }
      .tagline {
        font-size: 1.2em;
        color: rgba(60, 60, 67, 0.78);
        margin: 5px 0;
      }
      .image {
        flex: 0 1 auto;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .image-container {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .VPImage {
        height: 150px;
        max-width: 100%;
      }
      main {
        padding-top: 10px;
      }

      /* Responsive adjustments */
      @media (max-width: 768px) {
        .inner-body {
          height: calc(100vh - 20px);
          margin: 10px 5px;
          padding: 10px 5px;
        }
        .header {
          flex-direction: column;
          align-items: center;
        }
        .name {
          font-size: 2em;
        }
        .tagline {
          font-size: 1em;
        }
        .VPImage {
          height: 120px;
        }
      }

      @media (max-width: 480px) {
        .inner-body {
          margin: 5px;
          padding: 5px;
        }
        .name {
          font-size: 1.5em;
        }
        .tagline {
          font-size: 0.9em;
        }
        .VPImage {
          height: 100px;
        }
      }
    </style>
  </head>
  <body>
    <div class="inner-body">
      <div class="header">
        <div class="main">
          <h1 class="name">
            <span class="clip">CourseFinder</span>
          </h1>
          <p class="tagline">Wahlpflichtfachanmeldung</p>
        </div>
        <div class="image">
          <div class="image-container">
            <div class="image-bg"></div>
            <img
              class="VPImage"
              onerror="this.style.display='none';"
              src="https://hochschule-augsburg.github.io/course-finder/logo.svg"
              alt="CourseFinder Logo"
            />
          </div>
        </div>
      </div>
      <main>{{CONTENT}}</main>
    </div>
  </body>
</html>
`
