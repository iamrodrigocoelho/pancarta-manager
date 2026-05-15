import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { hashPassword, generateTemporaryPassword } from '@/lib/password'
import { sendTemporaryPasswordEmail } from '@/lib/email'
import { AUDIT_ACTIONS } from '@/types'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request)
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await params
  const user = await prisma.user.findUnique({ where: { id } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const tempPassword = generateTemporaryPassword()
  const hash = await hashPassword(tempPassword)

  await prisma.user.update({
    where: { id },
    data: { senha_hash: hash, primeiro_acesso: true, login_attempts: 0, locked_until: null },
  })

  if (user.email) {
    try {
      await sendTemporaryPasswordEmail(user.email, user.nome, tempPassword)
    } catch (err) {
      console.error('[EMAIL] Failed to send temp password:', err)
    }
  }

  await createAuditLog({
    acao: AUDIT_ACTIONS.RESET_SENHA_ADMIN,
    entidade: 'User',
    entidadeId: user.id,
    session,
    dadosNovos: { matricula: user.matricula },
    request,
  })

  return NextResponse.json({ data: { tempPassword, emailEnviado: !!user.email } })
}
