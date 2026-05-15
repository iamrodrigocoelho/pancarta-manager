import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const templates = await prisma.template.findMany({
    where: { status: 'ATIVO' },
    select: { id: true, nome: true, formato: true, versao: true },
    orderBy: { formato: 'asc' },
  })

  return NextResponse.json({ data: templates })
}
