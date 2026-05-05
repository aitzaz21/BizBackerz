import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
dotenv.config({ path: resolve(__dirname, '.env') })

console.log('\n── Email config ──────────────────────────')
console.log('HOST :', process.env.EMAIL_HOST)
console.log('PORT :', process.env.EMAIL_PORT)
console.log('USER :', process.env.EMAIL_USER)
console.log('PASS :', process.env.EMAIL_PASS ? '***set***' : 'MISSING')
console.log('TO   :', process.env.ADMIN_EMAIL)
console.log('──────────────────────────────────────────\n')

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: Number(process.env.EMAIL_PORT || 465) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: { rejectUnauthorized: false },
})

console.log('Verifying SMTP connection…')
transporter.verify((err) => {
  if (err) {
    console.error('SMTP FAILED ✗\n', err.message)
    process.exit(1)
  }

  console.log('SMTP connection OK ✓  — sending test email…')
  transporter.sendMail({
    from: `"BizBackerz Test" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: 'BizBackerz — SMTP test',
    text: 'If you see this, the webmail SMTP is working correctly.',
  }, (err, info) => {
    if (err) { console.error('Send FAILED ✗\n', err.message); process.exit(1) }
    console.log('Email sent ✓  ID:', info.messageId)
  })
})
