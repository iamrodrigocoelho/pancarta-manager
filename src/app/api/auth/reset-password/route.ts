import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createHash } from 'crypto'
import { hashPassword } from '@/lib/password'
import { createAuditLog } from '@/lib/audit'
import { resetPasswordSchema } from '@/lib/validations'
import { AUDIT_ACTIONS } from '@/types'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = resetPasswordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 400 }
    )
  }

  const { token, newPassword } = parsed.data
  const tokenHash = createHash('sha256').update(token).digest('hex')

  const resetToken = await prisma.passwordResetToken.findFirst({
    where: { token_hash: tokenHash, used: false, expires_at: { gt: new Date() } },
    include: { user: true },
  })

  if (!resetToken) {
    return NextResponse.json({ error: 'Link inválido ou expirado' }, { status: 400 })
  }

  const hash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: resetToken.user_id },
    data: { senha_hash: hash, primeiro_acesso: false, login_attempts: 0, locked_until: null },
  })

  await prisma.passwordResetToken.update({
    where: { id: resetToken.id },
    data: { used: true },
  })

  await createAuditLog({
    acao: AUDIT_ACTIONS.RECUPERACAO_SENHA,
    entidade: 'User',
    entidadeId: resetToken.user_id,
    matricula: resetToken.user.matricula,
    request,
  })

  return NextResponse.json({ ok: true })
}
