import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { generateLegalText } from '@/lib/legal-text'
import { createPosterSchema } from '@/lib/validations'
import { AUDIT_ACTIONS } from '@/types'

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const page = Math.max(1, Number(searchParams.get('page') ?? 1))
  const pageSize = Math.min(50, Number(searchParams.get('pageSize') ?? 20))
  const status = searchParams.get('status')
  const formato = searchParams.get('formato')

  // Segregação por loja: LOJA só vê a própria loja
  const lojaFilter =
    session.perfil === 'LOJA'
      ? { loja_id: session.lojaId }
      : session.perfil === 'AREA_CENTRAL'
        ? {}
        : {}

  const where = {
    ...lojaFilter,
    ...(status ? { status: status as never } : {}),
    ...(formato ? { template: { formato: formato as never } } : {}),
    status: { notIn: ['EXPIRADA'] as never[] },
  }

  const [posters, total] = await Promise.all([
    prisma.poster.findMany({
      where,
      include: {
        template: { select: { formato: true, nome: true } },
        store: { select: { codigo: true, nome: true } },
        criador: { select: { matricula: true, nome: true } },
        aprovador: { select: { matricula: true, nome: true } },
        pdf_file: { select: { id: true, expira_em: true, status: true } },
      },
      orderBy: { criado_em: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.poster.count({ where }),
  ])

  return NextResponse.json({ data: posters, total, page, pageSize })
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = createPosterSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 })
  }

  const data = parsed.data

  // Loja só pode criar para si mesma
  const lojaId =
    session.perfil === 'LOJA'
      ? session.lojaId
      : (data.lojaId ?? session.lojaId)

  const template = await prisma.template.findUnique({ where: { id: data.templateId } })
  if (!template || template.status !== 'ATIVO') {
    return NextResponse.json({ error: 'Template não encontrado' }, { status: 404 })
  }

  const textoLegal = generateLegalText({
    dataValidade: data.dataValidade,
    canalOferta: data.canalOferta,
    ean: data.ean,
    codigoProduto: data.codigoProduto,
  })

  const expiraEm = new Date(Date.now() + 2 * 24 * 60 * 60_000)

  // LOJA starts at AGUARDANDO_CONFERENCIA, others at RASCUNHO
  const status = session.perfil === 'LOJA' ? 'AGUARDANDO_CONFERENCIA' : 'RASCUNHO'

  const poster = await prisma.poster.create({
    data: {
      template_id: data.templateId,
      loja_id: lojaId ?? null,
      campanha: data.campanha ?? null,
      descricao_produto: data.descricaoProduto,
      preco_loja: data.precoLoja,
      preco_app_site: data.precoAppSite,
      ean: data.ean,
      codigo_produto: data.codigoProduto,
      data_validade: data.dataValidade,
      canal_oferta: data.canalOferta,
      texto_legal: textoLegal,
      observacoes: data.observacoes ?? null,
      origem: 'MANUAL',
      status,
      criado_por: session.id,
      expira_em: expiraEm,
    },
  })

  await createAuditLog({
    acao: AUDIT_ACTIONS.CRIACAO_PANCARTA,
    entidade: 'Poster',
    entidadeId: poster.id,
    session,
    dadosNovos: { descricao: data.descricaoProduto, formato: template.formato, status },
    request,
  })

  return NextResponse.json({ data: poster }, { status: 201 })
}
