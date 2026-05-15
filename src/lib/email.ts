import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendPasswordResetEmail(
  email: string,
  nome: string,
  token: string
): Promise<void> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  const link = `${baseUrl}/reset-password?token=${token}`

  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Pancarta Manager" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: email,
    subject: 'Redefinição de senha — Pancarta Manager',
    html: `
      <p>Olá, ${nome}!</p>
      <p>Você solicitou a redefinição da sua senha no Pancarta Manager.</p>
      <p>Clique no link abaixo para cadastrar uma nova senha. O link expira em 30 minutos.</p>
      <p><a href="${link}" style="color:#C41E3A;font-weight:bold;">Redefinir minha senha</a></p>
      <p>Se você não solicitou a redefinição, ignore este e-mail.</p>
      <br/>
      <p>Equipe Pancarta Manager</p>
    `,
  })
}

export async function sendTemporaryPasswordEmail(
  email: string,
  nome: string,
  tempPassword: string
): Promise<void> {
  const transporter = getTransporter()
  await transporter.sendMail({
    from: `"Pancarta Manager" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
    to: email,
    subject: 'Sua senha foi redefinida — Pancarta Manager',
    html: `
      <p>Olá, ${nome}!</p>
      <p>Sua senha foi redefinida pelo administrador.</p>
      <p>Sua senha temporária é: <strong>${tempPassword}</strong></p>
      <p>Você deverá alterá-la no próximo acesso.</p>
      <br/>
      <p>Equipe Pancarta Manager</p>
    `,
  })
}
