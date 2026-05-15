import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { updateUserSchema } from '@/lib/validations'
import { AUDIT_ACTIONS } from '@/types'

// ─── GET /api/admin/users/[id] ────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request)
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await params
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      matricula: true,
      nome: true,
      email: true,
      perfil: true,
      status: true,
      primeiro_acesso: true,
      ultimo_login_em: true,
      criado_em: true,
      loja_id: true,
      regional_id: true,
      store: { select: { id: true, codigo: true, nome: true } },
      regional: { select: { id: true, nome: true } },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ data: user })
}

// ─── PATCH /api/admin/users/[id] ─────────────────────────────────────────────

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSessionFromRequest(request)
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = updateUserSchema.safeParse({ ...(body as Record<string, unknown>), id })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Dados inválidos' },
      { status: 400 }
    )
  }

  const data = parsed.data

  if (data.perfil === 'LOJA' && !data.lojaId) {
    return NextResponse.json({ error: 'Loja obrigatória para perfil LOJA' }, { status: 400 })
  }

  const existing = await prisma.user.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 })
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.nome !== undefined && { nome: data.nome }),
      ...(data.email !== undefined && { email: data.email || null }),
      ...(data.perfil !== undefined && { perfil: data.perfil }),
      ...(data.lojaId !== undefined && { loja_id: data.lojaId || null }),
      ...(data.regionalId !== undefined && { regional_id: data.regionalId || null }),
      ...(data.status !== undefined && { status: data.status }),
    },
    select: {
      id: true,
      matricula: true,
      nome: true,
      email: true,
      perfil: true,
      status: true,
      primeiro_acesso: true,
      ultimo_login_em: true,
      criado_em: true,
      loja_id: true,
      regional_id: true,
      store: { select: { id: true, codigo: true, nome: true } },
      regional: { select: { id: true, nome: true } },
    },
  })

  await createAuditLog({
    acao: AUDIT_ACTIONS.EDICAO_USUARIO,
    entidade: 'User',
    entidadeId: id,
    session,
    dadosAnteriores: {
      nome: existing.nome,
      email: existing.email,
      perfil: existing.perfil,
      status: existing.status,
      loja_id: existing.loja_id,
    },
    dadosNovos: {
      nome: updated.nome,
      email: updated.email,
      perfil: updated.perfil,
      status: updated.status,
      loja_id: updated.loja_id,
    },
    request,
  })

  return NextResponse.json({ data: updated })
}
