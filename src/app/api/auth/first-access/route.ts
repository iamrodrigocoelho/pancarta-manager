import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, verifyPassword } from '@/lib/password'
import { getSessionFromRequest, setSessionCookie } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { firstAccessSchema } from '@/lib/validations'
import { AUDIT_ACTIONS } from '@/types'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = firstAccessSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 400 }
    )
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({ where: { id: session.id } })
  if (!user) return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })

  const valid = await verifyPassword(user.senha_hash, currentPassword)
  if (!valid) return NextResponse.json({ error: 'Senha atual incorreta' }, { status: 400 })

  const hash = await hashPassword(newPassword)
  await prisma.user.update({
    where: { id: user.id },
    data: { senha_hash: hash, primeiro_acesso: false },
  })

  const updatedSession = { ...session, primeiroAcesso: false }
  await setSessionCookie(updatedSession)

  await createAuditLog({
    acao: AUDIT_ACTIONS.TROCA_SENHA_PRIMEIRO_ACESSO,
    entidade: 'User',
    entidadeId: user.id,
    session,
    request,
  })

  return NextResponse.json({ ok: true })
}
