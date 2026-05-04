import nodemailer from 'nodemailer'

function createTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_FROM,
      pass: process.env.EMAIL_APP_PASSWORD,
    },
  })
}

/* ─── Shared HTML shell ─── */
function layout(content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{background:#060f1d;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  .wrap{padding:24px;background:#060f1d}
  .card{max-width:580px;margin:0 auto;background:#0a1628;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.07)}
  .head{background:linear-gradient(135deg,#0d2050,#060f1d);padding:32px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.05)}
  .logo{font-size:22px;font-weight:800;letter-spacing:-0.04em;color:#2a8bff}
  .logo span{color:#38d9a9}
  .tag{font-size:11px;color:rgba(255,255,255,0.3);margin-top:4px;letter-spacing:0.1em;text-transform:uppercase}
  .body{padding:36px;color:rgba(200,210,222,0.85);font-size:15px;line-height:1.7}
  .body h2{color:#fff;font-size:20px;font-weight:700;margin-bottom:12px;letter-spacing:-0.02em}
  .body p{color:rgba(200,210,222,0.75);margin-bottom:12px}
  .btn-wrap{text-align:center;margin:28px 0}
  .btn{display:inline-block;background:linear-gradient(135deg,#2a8bff,#1a6fd8);color:#fff!important;text-decoration:none;padding:14px 36px;border-radius:10px;font-weight:700;font-size:15px;letter-spacing:-0.01em}
  .info{background:rgba(42,139,255,0.07);border:1px solid rgba(42,139,255,0.18);border-radius:10px;padding:20px;margin:20px 0}
  .row{display:flex;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,0.04);font-size:14px}
  .row:last-child{border-bottom:none}
  .lbl{color:rgba(255,255,255,0.35);min-width:96px;flex-shrink:0}
  .val{color:#e8eef5;font-weight:600}
  .foot{background:#040c1a;padding:22px;text-align:center;font-size:12px;color:rgba(255,255,255,0.25);border-top:1px solid rgba(255,255,255,0.04)}
  .foot a{color:#2a8bff;text-decoration:none}
  .muted{font-size:12px;color:rgba(200,210,222,0.35);line-height:1.6}
  .badge-ok{display:inline-block;background:rgba(56,217,169,0.12);border:1px solid rgba(56,217,169,0.3);color:#38d9a9;border-radius:999px;padding:3px 12px;font-size:12px;font-weight:600}
  .badge-warn{display:inline-block;background:rgba(245,158,11,0.12);border:1px solid rgba(245,158,11,0.3);color:#f59e0b;border-radius:999px;padding:3px 12px;font-size:12px;font-weight:600}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="head">
      <div class="logo">Biz<span>Backerz</span></div>
      <div class="tag">Virtual Assistant Services</div>
    </div>
    <div class="body">${content}</div>
    <div class="foot">© 2026 BizBackerz · All rights reserved · <a href="https://bizbackerz.com">bizbackerz.com</a></div>
  </div>
</div>
</body>
</html>`
}

/* ─── Contact form: admin alert ─── */
export async function sendAdminContactAlert({ name, email, phone, message }) {
  const html = layout(`
    <h2>📬 New Contact Form Message</h2>
    <p>A visitor has submitted the contact form on <strong style="color:#fff">bizbackerz.com</strong>. Details below:</p>
    <div class="info">
      <div class="row"><span class="lbl">Name</span><span class="val">${name}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val"><a href="mailto:${email}" style="color:#2a8bff">${email}</a></span></div>
      ${phone ? `<div class="row"><span class="lbl">Phone</span><span class="val">${phone}</span></div>` : ''}
      <div class="row"><span class="lbl">Message</span><span class="val" style="white-space:pre-wrap">${message}</span></div>
      <div class="row"><span class="lbl">Received</span><span class="val">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'medium', timeStyle: 'short' })} ET</span></div>
    </div>
    <div class="btn-wrap">
      <a href="mailto:${email}" class="btn">Reply to ${name}</a>
    </div>
    <p class="muted">This message was sent from the Contact page of bizbackerz.com.</p>
  `)

  await createTransporter().sendMail({
    from: `"BizBackerz Contact" <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `📬 New Message from ${name} — bizbackerz.com`,
    html,
  })
}

/* ─── Contact form: user auto-reply ─── */
export async function sendContactFormEmail({ name, email, message }) {
  const html = layout(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="width:64px;height:64px;background:rgba(42,139,255,0.12);border:2px solid rgba(42,139,255,0.35);border-radius:20px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px">✉️</div>
      <h2 style="margin:0">We got your message!</h2>
    </div>
    <p>Hi <strong style="color:#fff">${name}</strong>,</p>
    <p>Thank you for reaching out to BizBackerz. We've received your message and a member of our team will get back to you within <strong style="color:#fff">24 hours</strong>.</p>
    <div class="info">
      <div class="row"><span class="lbl">Your message</span><span class="val" style="white-space:pre-wrap">${message}</span></div>
    </div>
    <p>In the meantime, feel free to book a free 30-minute strategy call — it's the fastest way to get started.</p>
    <div class="btn-wrap">
      <a href="${process.env.CLIENT_URL || 'https://bizbackerz.com'}/booking" class="btn">Book a Free Call</a>
    </div>
    <p class="muted">If you have any urgent queries, call us at <a href="tel:+19046686362" style="color:#2a8bff">(904) 668-6362</a> or email <a href="mailto:Hello@bizbackerz.com" style="color:#2a8bff">Hello@bizbackerz.com</a>.</p>
  `)

  await createTransporter().sendMail({
    from: `"BizBackerz" <${process.env.EMAIL_FROM}>`,
    to: email,
    subject: `We received your message — BizBackerz`,
    html,
  })
}

/* ─── 1. User confirmation request ─── */
export async function sendConfirmationEmail(booking) {
  const confirmUrl = `${process.env.SERVER_URL || 'http://localhost:3001'}/api/bookings/confirm/${booking.confirmToken}`

  const html = layout(`
    <h2>Confirm Your Appointment</h2>
    <p>Hi <strong style="color:#fff">${booking.name}</strong>,</p>
    <p>You've requested a free 30-minute Zoom consultation with the BizBackerz team. Please confirm your appointment by clicking the button below.</p>
    <div class="btn-wrap"><a href="${confirmUrl}" class="btn">✓ &nbsp;Confirm My Appointment</a></div>
    <div class="info">
      <div class="row"><span class="lbl">Date & Time</span><span class="val">${booking.slotDisplayUser}</span></div>
      <div class="row"><span class="lbl">Duration</span><span class="val">30 minutes</span></div>
      <div class="row"><span class="lbl">Format</span><span class="val">Zoom Video Call</span></div>
    </div>
    <p class="muted">⚠️ This confirmation link expires in 24 hours. If you did not book this appointment, simply ignore this email.</p>
  `)

  await createTransporter().sendMail({
    from: `"BizBackerz" <${process.env.EMAIL_FROM}>`,
    to: booking.email,
    subject: `Please confirm your appointment — ${booking.slotDisplayUser}`,
    html,
  })
}

/* ─── 2. Admin notification (new pending booking) ─── */
export async function sendAdminNewBooking(booking) {
  const html = layout(`
    <h2>📅 New Booking Request</h2>
    <p>A new consultation has been requested and is <span class="badge-warn">Pending Confirmation</span> from the client.</p>
    <div class="info">
      <div class="row"><span class="lbl">Name</span><span class="val">${booking.name}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val">${booking.email}</span></div>
      <div class="row"><span class="lbl">Phone</span><span class="val">${booking.phone}</span></div>
      <div class="row"><span class="lbl">Country</span><span class="val">${booking.country}</span></div>
      <div class="row"><span class="lbl">Timezone</span><span class="val">${booking.timezone}</span></div>
      <div class="row"><span class="lbl">Time (ET)</span><span class="val">${booking.slotDisplayPKT}</span></div>
      <div class="row"><span class="lbl">Time (Client)</span><span class="val">${booking.slotDisplayUser}</span></div>
    </div>
    <p class="muted">The client must click the confirmation link in their email before this booking is locked in.</p>
  `)

  await createTransporter().sendMail({
    from: `"BizBackerz Bookings" <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🗓 New Booking (Pending): ${booking.name} — ${booking.slotDisplayPKT}`,
    html,
  })
}

/* ─── 3. User booking confirmed ─── */
export async function sendBookingConfirmedToUser(booking) {
  const html = layout(`
    <div style="text-align:center;margin-bottom:28px">
      <div style="width:64px;height:64px;background:rgba(56,217,169,0.12);border:2px solid rgba(56,217,169,0.35);border-radius:20px;display:inline-flex;align-items:center;justify-content:center;font-size:26px;margin-bottom:16px">✓</div>
      <h2 style="margin:0">Your Appointment is Confirmed!</h2>
    </div>
    <p>Hi <strong style="color:#fff">${booking.name}</strong>, your free Zoom consultation with BizBackerz is officially confirmed. We're looking forward to speaking with you!</p>
    <div class="info">
      <div class="row"><span class="lbl">Date & Time</span><span class="val">${booking.slotDisplayUser}</span></div>
      <div class="row"><span class="lbl">Duration</span><span class="val">30 minutes</span></div>
      <div class="row"><span class="lbl">Format</span><span class="val">Zoom Video Call</span></div>
      <div class="row"><span class="lbl">Status</span><span class="val"><span class="badge-ok">✓ Confirmed</span></span></div>
    </div>
    <p>We'll send your Zoom meeting link closer to the appointment date. If you have any questions, reply to this email or reach us at <a href="mailto:Hello@bizbackerz.com" style="color:#2a8bff">Hello@bizbackerz.com</a>.</p>
    <p class="muted">Need to reschedule? Please contact us at least 24 hours before your appointment.</p>
  `)

  await createTransporter().sendMail({
    from: `"BizBackerz" <${process.env.EMAIL_FROM}>`,
    to: booking.email,
    subject: `✓ Confirmed: Your Zoom Call — ${booking.slotDisplayUser}`,
    html,
  })
}

/* ─── 4. Admin notification (booking confirmed) ─── */
export async function sendAdminConfirmed(booking) {
  const html = layout(`
    <h2>✅ Booking Confirmed</h2>
    <p><strong style="color:#fff">${booking.name}</strong> has confirmed their appointment. Please prepare the Zoom link and send it to the client.</p>
    <div class="info">
      <div class="row"><span class="lbl">Name</span><span class="val">${booking.name}</span></div>
      <div class="row"><span class="lbl">Email</span><span class="val"><a href="mailto:${booking.email}" style="color:#2a8bff">${booking.email}</a></span></div>
      <div class="row"><span class="lbl">Phone</span><span class="val">${booking.phone}</span></div>
      <div class="row"><span class="lbl">Country</span><span class="val">${booking.country}</span></div>
      <div class="row"><span class="lbl">Time (ET)</span><span class="val">${booking.slotDisplayPKT}</span></div>
      <div class="row"><span class="lbl">Time (Client)</span><span class="val">${booking.slotDisplayUser}</span></div>
    </div>
  `)

  await createTransporter().sendMail({
    from: `"BizBackerz Bookings" <${process.env.EMAIL_FROM}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `✅ Confirmed: ${booking.name} — ${booking.slotDisplayPKT}`,
    html,
  })
}
