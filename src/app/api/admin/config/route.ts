import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { updateConfigSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const configs = await prisma.appConfig.findMany({ orderBy: { chave: 'asc' } })
  return NextResponse.json({ data: configs })
}

export async function PUT(request: NextRequest) {
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

  const parsed = updateConfigSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const { chave, valor } = parsed.data
  const config = await prisma.appConfig.upsert({
    where: { chave },
    update: { valor, atualizado_por: session.id },
    create: { chave, valor, atualizado_por: session.id },
  })

  return NextResponse.json({ data: config })
}
