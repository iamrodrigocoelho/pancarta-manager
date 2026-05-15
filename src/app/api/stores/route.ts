import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createStoreSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const stores = await prisma.store.findMany({
    where: { status: 'ATIVO' },
    select: { id: true, codigo: true, nome: true, regional: { select: { nome: true } } },
    orderBy: { codigo: 'asc' },
  })

  return NextResponse.json({ data: stores })
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

  const parsed = createStoreSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })

  const exists = await prisma.store.findUnique({ where: { codigo: parsed.data.codigo } })
  if (exists) return NextResponse.json({ error: 'Código de loja já cadastrado' }, { status: 409 })

  const store = await prisma.store.create({
    data: {
      codigo: parsed.data.codigo,
      nome: parsed.data.nome,
      regional_id: parsed.data.regionalId ?? null,
      status: parsed.data.status,
    },
  })

  return NextResponse.json({ data: store }, { status: 201 })
}
