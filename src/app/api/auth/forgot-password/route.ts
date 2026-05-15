import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash, randomBytes } from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'
import { createAuditLog } from '@/lib/audit'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { forgotPasswordSchema } from '@/lib/validations'
import { AUDIT_ACTIONS } from '@/types'

export async function POST(request: NextRequest) {
  const key = getRateLimitKey(request, 'forgot-password')
  if (!rateLimit(key, 5, 60_000)) {
    return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = forgotPasswordSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const { matriculaOrEmail } = parsed.data

  const user = await prisma.user.findFirst({
    where: {
      OR: [{ matricula: matriculaOrEmail }, { email: matriculaOrEmail }],
      status: 'ATIVO',
    },
  })

  // Always return ok to avoid user enumeration
  if (!user || !user.email) {
    return NextResponse.json({
      message:
        'Se existir uma conta com e-mail cadastrado, você receberá as instruções de redefinição.',
    })
  }

  // Generate token
  const rawToken = randomBytes(32).toString('hex')
  const tokenHash = createHash('sha256').update(rawToken).digest('hex')
  const expiresAt = new Date(Date.now() + 30 * 60_000) // 30 minutes

  await prisma.passwordResetToken.deleteMany({ where: { user_id: user.id, used: false } })
  await prisma.passwordResetToken.create({
    data: { user_id: user.id, token_hash: tokenHash, expires_at: expiresAt },
  })

  try {
    await sendPasswordResetEmail(user.email, user.nome, rawToken)
  } catch (err) {
    console.error('[EMAIL] Failed to send password reset email:', err)
  }

  await createAuditLog({
    acao: AUDIT_ACTIONS.RECUPERACAO_SENHA,
    entidade: 'User',
    entidadeId: user.id,
    matricula: user.matricula,
    request,
  })

  return NextResponse.json({
    message:
      'Se existir uma conta com e-mail cadastrado, você receberá as instruções de redefinição.',
  })
}
