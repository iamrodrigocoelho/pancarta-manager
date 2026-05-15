import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { AUDIT_ACTIONS } from '@/types'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  const poster = await prisma.poster.findUnique({
    where: { id },
    include: { store: true },
  })

  if (!poster) return NextResponse.json({ error: 'Pancarta não encontrada' }, { status: 404 })

  // Segregação: LOJA só aprova a própria loja
  if (session.perfil === 'LOJA' && poster.loja_id !== session.lojaId) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  if (poster.status !== 'AGUARDANDO_CONFERENCIA') {
    return NextResponse.json(
      { error: 'Pancarta não está aguardando conferência' },
      { status: 400 }
    )
  }

  const updatedPoster = await prisma.poster.update({
    where: { id },
    data: {
      status: 'APROVADA_PELA_LOJA',
      aprovado_por: session.id,
      aprovado_em: new Date(),
    },
  })

  await createAuditLog({
    acao: AUDIT_ACTIONS.APROVACAO_PANCARTA,
    entidade: 'Poster',
    entidadeId: poster.id,
    session,
    dadosAnteriores: { status: poster.status },
    dadosNovos: { status: 'APROVADA_PELA_LOJA' },
    request,
  })

  return NextResponse.json({ data: updatedPoster })
}
