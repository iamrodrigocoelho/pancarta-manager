import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { generateLegalText } from '@/lib/legal-text'
import { csvPosterRowSchema, MAX_CSV_ROWS } from '@/lib/csv-schemas'
import { rateLimit, getRateLimitKey } from '@/lib/rate-limit'
import { AUDIT_ACTIONS } from '@/types'
import type { CsvPosterRowValidated } from '@/types'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const key = getRateLimitKey(request, 'csv-upload')
  if (!rateLimit(key, 5, 60_000)) {
    return NextResponse.json({ error: 'Muitas tentativas.' }, { status: 429 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
  if (!file.name.endsWith('.csv')) {
    return NextResponse.json({ error: 'Somente arquivos .csv são aceitos' }, { status: 400 })
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Arquivo muito grande (máx. 5MB)' }, { status: 400 })
  }

  const text = await file.text()
  const { data: rows } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (rows.length > MAX_CSV_ROWS) {
    return NextResponse.json(
      { error: `CSV excede o limite de ${MAX_CSV_ROWS} linhas (encontrado: ${rows.length})` },
      { status: 400 }
    )
  }

  // Validate each row
  const validatedRows: CsvPosterRowValidated[] = rows.map((row, idx) => {
    const parsed = csvPosterRowSchema.safeParse(row)
    if (parsed.success) {
      return { ...parsed.data, _linha: idx + 2, _valida: true, _erros: [] }
    }
    return {
      ...row,
      _linha: idx + 2,
      _valida: false,
      _erros: parsed.error.issues.map((e) => e.message),
    } as CsvPosterRowValidated
  })

  const linhasValidas = validatedRows.filter((r) => r._valida).length
  const linhasInvalidas = validatedRows.length - linhasValidas

  const csvImport = await prisma.csvImport.create({
    data: {
      nome_arquivo: file.name,
      tipo: 'PANCARTAS',
      usuario_id: session.id,
      loja_id: session.lojaId,
      total_linhas: rows.length,
      linhas_validas: linhasValidas,
      linhas_invalidas: linhasInvalidas,
      status: linhasInvalidas === 0 ? 'CONCLUIDO' : 'PARCIAL',
      erros: validatedRows.filter((r) => !r._valida) as unknown as never,
    },
  })

  await createAuditLog({
    acao: AUDIT_ACTIONS.UPLOAD_CSV_PANCARTAS,
    entidade: 'CsvImport',
    entidadeId: csvImport.id,
    session,
    dadosNovos: { filename: file.name, total: rows.length, validas: linhasValidas, invalidas: linhasInvalidas },
    request,
  })

  return NextResponse.json({
    data: { importId: csvImport.id, rows: validatedRows, linhasValidas, linhasInvalidas },
  })
}

// Confirm import (create posters from valid rows)
export async function PUT(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  let body: { rows: CsvPosterRowValidated[]; importId: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const validRows = body.rows.filter((r) => r._valida)
  if (validRows.length === 0) {
    return NextResponse.json({ error: 'Nenhuma linha válida para criar' }, { status: 400 })
  }

  const template = await prisma.template.findFirst({
    where: { status: 'ATIVO', formato: 'A4' },
  })
  if (!template) return NextResponse.json({ error: 'Template não encontrado' }, { status: 500 })

  const expiraEm = new Date(Date.now() + 2 * 24 * 60 * 60_000)
  const status = session.perfil === 'LOJA' ? 'AGUARDANDO_CONFERENCIA' : 'RASCUNHO'

  const created = []
  for (const row of validRows) {
    // Resolve template by format
    const tmpl = await prisma.template.findFirst({
      where: { status: 'ATIVO', formato: row.formato as 'A4' | 'A6' },
    })
    if (!tmpl) continue

    let lojaId: string | null = session.lojaId ?? null
    if (session.perfil !== 'LOJA' && row.loja) {
      const store = await prisma.store.findUnique({ where: { codigo: row.loja } })
      if (store) lojaId = store.id
    }

    const textoLegal = generateLegalText({
      dataValidade: row.data_validade,
      canalOferta: row.canal_oferta,
      ean: row.ean,
      codigoProduto: row.codigo_produto,
    })

    const poster = await prisma.poster.create({
      data: {
        template_id: tmpl.id,
        loja_id: lojaId,
        campanha: row.campanha ?? null,
        descricao_produto: row.descricao_produto,
        preco_loja: row.preco_loja,
        preco_app_site: row.preco_app_site,
        ean: row.ean,
        codigo_produto: row.codigo_produto,
        data_validade: row.data_validade,
        canal_oferta: row.canal_oferta,
        texto_legal: textoLegal,
        observacoes: null,
        origem: 'CSV',
        status: status as never,
        criado_por: session.id,
        expira_em: expiraEm,
      },
    })
    created.push(poster.id)
  }

  return NextResponse.json({ data: { created: created.length, ids: created } }, { status: 201 })
}
