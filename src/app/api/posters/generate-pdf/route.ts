import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { generatePosterPdf, savePdfToStorage } from '@/lib/pdf'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { generatePdfSchema } from '@/lib/validations'
import { AUDIT_ACTIONS } from '@/types'
import type { TemplatePositions } from '@/types'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const key = getRateLimitKey(request, 'generate-pdf')
  if (!rateLimit(key, 5, 60_000)) {
    return NextResponse.json({ error: 'Muitas solicitações de PDF.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = generatePdfSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })

  const { posterIds } = parsed.data

  const posters = await prisma.poster.findMany({
    where: { id: { in: posterIds } },
    include: { template: true, store: true },
  })

  if (posters.length !== posterIds.length) {
    return NextResponse.json({ error: 'Uma ou mais pancartas não foram encontradas' }, { status: 404 })
  }

  // Authorization checks
  for (const poster of posters) {
    if (session.perfil === 'LOJA') {
      if (poster.loja_id !== session.lojaId) {
        return NextResponse.json({ error: 'Acesso negado a uma das pancartas' }, { status: 403 })
      }
      // LOJA must have approved the poster
      if (poster.status !== 'APROVADA_PELA_LOJA') {
        return NextResponse.json(
          { error: 'A pancarta deve ser aprovada antes de gerar o PDF' },
          { status: 400 }
        )
      }
    }
  }

  const pdfData = posters.map((p) => {
    const positions = p.template.configuracao_posicoes as unknown as TemplatePositions
    return {
      descricaoProduto: p.descricao_produto,
      precoLoja: p.preco_loja,
      precoAppSite: p.preco_app_site,
      textoLegal: p.texto_legal,
      formato: p.template.formato as 'A4' | 'A6',
      positions,
    }
  })

  const pdfBytes = await generatePosterPdf(pdfData)

  const firstPoster = posters[0]!
  const campanha = firstPoster.campanha ?? 'lote'
  const lojaCode = firstPoster.store?.codigo ?? session.lojaCode ?? 'central'
  const dateStr = new Date().toISOString().slice(0, 10)
  const filename = `pancartas_${lojaCode}_${campanha}_${dateStr}_${randomUUID().slice(0, 8)}.pdf`

  const storagePath = await savePdfToStorage(pdfBytes, filename)
  const expiraEm = new Date(Date.now() + 2 * 24 * 60 * 60_000)

  const pdfFile = await prisma.pdfFile.create({
    data: {
      nome_arquivo: filename,
      storage_path: storagePath,
      modo_geracao: 'SINGLE_MULTIPAGE',
      gerado_por: session.id,
      expira_em: expiraEm,
    },
  })

  // Update poster statuses and link pdf
  await prisma.poster.updateMany({
    where: { id: { in: posterIds } },
    data: { status: 'PDF_GERADO', pdf_id: pdfFile.id },
  })

  await createAuditLog({
    acao: AUDIT_ACTIONS.GERACAO_PDF,
    entidade: 'PdfFile',
    entidadeId: pdfFile.id,
    session,
    dadosNovos: { filename, posterIds },
    request,
  })

  return NextResponse.json({ data: { id: pdfFile.id, filename, expiraEm } }, { status: 201 })
}
