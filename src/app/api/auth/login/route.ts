import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword } from '@/lib/password'
import { setSessionCookie } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { loginSchema } from '@/lib/validations'
import { AUDIT_ACTIONS } from '@/types'

const LOGIN_ATTEMPTS_LIMIT = 5
const LOCKOUT_MINUTES = 15

export async function POST(request: NextRequest) {
  const key = getRateLimitKey(request, 'login')
  if (!rateLimit(key, 10, 60_000)) {
    return NextResponse.json({ error: 'Muitas tentativas. Aguarde um momento.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const { matricula, password } = parsed.data

  const user = await prisma.user.findUnique({
    where: { matricula },
    include: { store: { select: { id: true, codigo: true, nome: true } } },
  })

  if (!user || user.status === 'INATIVO') {
    await createAuditLog({
      acao: AUDIT_ACTIONS.FALHA_LOGIN,
      entidade: 'User',
      matricula,
      request,
    })
    return NextResponse.json({ error: 'Matrícula ou senha inválidos' }, { status: 401 })
  }

  // Check lockout
  if (user.locked_until && user.locked_until > new Date()) {
    return NextResponse.json(
      { error: `Conta bloqueada. Tente novamente em ${LOCKOUT_MINUTES} minutos.` },
      { status: 403 }
    )
  }

  const valid = await verifyPassword(user.senha_hash, password)
  if (!valid) {
    const attempts = user.login_attempts + 1
    const shouldLock = attempts >= LOGIN_ATTEMPTS_LIMIT
    await prisma.user.update({
      where: { id: user.id },
      data: {
        login_attempts: attempts,
        locked_until: shouldLock
          ? new Date(Date.now() + LOCKOUT_MINUTES * 60_000)
          : undefined,
      },
    })

    await createAuditLog({
      acao: AUDIT_ACTIONS.FALHA_LOGIN,
      entidade: 'User',
      entidadeId: user.id,
      matricula: user.matricula,
      perfil: user.perfil,
      lojaId: user.loja_id ?? undefined,
      request,
    })

    const remaining = LOGIN_ATTEMPTS_LIMIT - attempts
    const message =
      remaining > 0
        ? `Matrícula ou senha inválidos. ${remaining} tentativa(s) restante(s).`
        : `Conta bloqueada por ${LOCKOUT_MINUTES} minutos.`
    return NextResponse.json({ error: message }, { status: 401 })
  }

  // Success — reset attempts
  await prisma.user.update({
    where: { id: user.id },
    data: {
      login_attempts: 0,
      locked_until: null,
      ultimo_login_em: new Date(),
    },
  })

  const sessionUser = {
    id: user.id,
    matricula: user.matricula,
    nome: user.nome,
    perfil: user.perfil,
    lojaId: user.loja_id,
    lojaCode: user.store?.codigo ?? null,
    lojaNome: user.store?.nome ?? null,
    primeiroAcesso: user.primeiro_acesso,
  }

  await setSessionCookie(sessionUser)

  await createAuditLog({
    acao: AUDIT_ACTIONS.LOGIN,
    entidade: 'User',
    entidadeId: user.id,
    session: sessionUser,
    request,
  })

  return NextResponse.json({
    user: sessionUser,
    primeiroAcesso: user.primeiro_acesso,
  })
}
