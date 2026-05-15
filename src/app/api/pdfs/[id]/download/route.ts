import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { AUDIT_ACTIONS } from '@/types'
import fs from 'fs/promises'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { id } = await params

  const pdfFile = await prisma.pdfFile.findUnique({
    where: { id },
    include: { posters: { include: { store: true } } },
  })

  if (!pdfFile || pdfFile.status !== 'DISPONIVEL') {
    return NextResponse.json({ error: 'Arquivo não encontrado ou expirado' }, { status: 404 })
  }

  if (new Date() > pdfFile.expira_em) {
    return NextResponse.json({ error: 'PDF expirado' }, { status: 410 })
  }

  // Segregação: LOJA só baixa PDF da própria loja
  if (session.perfil === 'LOJA') {
    const hasOtherStore = pdfFile.posters.some(
      (p) => p.loja_id && p.loja_id !== session.lojaId
    )
    if (hasOtherStore) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }
  }

  let fileBuffer: Buffer
  try {
    fileBuffer = await fs.readFile(pdfFile.storage_path)
  } catch {
    return NextResponse.json({ error: 'Arquivo não encontrado no servidor' }, { status: 404 })
  }

  // Update poster status to DOWNLOAD_REALIZADO
  await prisma.poster.updateMany({
    where: { pdf_id: pdfFile.id },
    data: { status: 'DOWNLOAD_REALIZADO' },
  })

  const ip =
    request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? null

  await prisma.downloadLog.create({
    data: {
      pdf_id: pdfFile.id,
      usuario_id: session.id,
      loja_id: session.lojaId,
      ip,
      user_agent: request.headers.get('user-agent'),
    },
  })

  await createAuditLog({
    acao: AUDIT_ACTIONS.DOWNLOAD_PDF,
    entidade: 'PdfFile',
    entidadeId: pdfFile.id,
    session,
    request,
  })

  return new NextResponse(new Uint8Array(fileBuffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFile.nome_arquivo}"`,
      'Cache-Control': 'no-store',
    },
  })
}
