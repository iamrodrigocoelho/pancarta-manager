import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'

// ─── GET /api/regions ─────────────────────────────────────────────────────────
// Returns all active regionals. Requires any authenticated session.

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const regionals = await prisma.regional.findMany({
    where: { status: 'ATIVO' },
    select: { id: true, nome: true, status: true },
    orderBy: { nome: 'asc' },
  })

  return NextResponse.json({ data: regionals })
}
