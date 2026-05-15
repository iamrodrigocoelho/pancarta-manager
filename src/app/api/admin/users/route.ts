import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { hashPassword, generateTemporaryPassword } from '@/lib/password'
import { createUserSchema } from '@/lib/validations'
import { AUDIT_ACTIONS } from '@/types'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? 20))
  const search = searchParams.get('search') ?? ''
  const status = searchParams.get('status')

  const where = {
    ...(search ? {
      OR: [
        { matricula: { contains: search, mode: 'insensitive' as const } },
        { nome: { contains: search, mode: 'insensitive' as const } },
      ],
    } : {}),
    ...(status ? { status: status as never } : {}),
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true, matricula: true, nome: true, email: true,
        perfil: true, status: true, primeiro_acesso: true,
        ultimo_login_em: true, criado_em: true,
        store: { select: { codigo: true, nome: true } },
        regional: { select: { nome: true } },
      },
      orderBy: { criado_em: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ])

  return NextResponse.json({ data: users, total, page, pageSize })
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = createUserSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const data = parsed.data

  if (data.perfil === 'LOJA' && !data.lojaId) {
    return NextResponse.json({ error: 'Loja obrigatória para perfil LOJA' }, { status: 400 })
  }

  const exists = await prisma.user.findUnique({ where: { matricula: data.matricula } })
  if (exists) return NextResponse.json({ error: 'Matrícula já cadastrada' }, { status: 409 })

  const tempPassword = generateTemporaryPassword()
  const hash = await hashPassword(tempPassword)

  const user = await prisma.user.create({
    data: {
      matricula: data.matricula,
      nome: data.nome,
      email: data.email || null,
      senha_hash: hash,
      perfil: data.perfil,
      loja_id: data.lojaId || null,
      regional_id: data.regionalId || null,
      status: data.status,
      primeiro_acesso: true,
    },
    select: {
      id: true, matricula: true, nome: true, email: true, perfil: true, status: true,
    },
  })

  await createAuditLog({
    acao: AUDIT_ACTIONS.CRIACAO_USUARIO,
    entidade: 'User',
    entidadeId: user.id,
    session,
    dadosNovos: { matricula: data.matricula, perfil: data.perfil },
    request,
  })

  return NextResponse.json({ data: { user, tempPassword } }, { status: 201 })
}
