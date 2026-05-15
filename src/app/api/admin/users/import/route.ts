import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionFromRequest } from '@/lib/auth'
import { createAuditLog } from '@/lib/audit'
import { hashPassword, generateTemporaryPassword } from '@/lib/password'
import { csvUserRowSchema, MAX_CSV_ROWS } from '@/lib/csv-schemas'
import { AUDIT_ACTIONS } from '@/types'
import type { CsvUserRowValidated } from '@/types'
import Papa from 'papaparse'

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'Arquivo não enviado' }, { status: 400 })
  if (!file.name.endsWith('.csv')) {
    return NextResponse.json({ error: 'Somente arquivos .csv são aceitos' }, { status: 400 })
  }

  const text = await file.text()
  const { data: rows } = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  })

  if (rows.length > MAX_CSV_ROWS) {
    return NextResponse.json(
      { error: `CSV excede o limite de ${MAX_CSV_ROWS} linhas` },
      { status: 400 }
    )
  }

  const validatedRows: CsvUserRowValidated[] = rows.map((row, idx) => {
    const parsed = csvUserRowSchema.safeParse(row)
    if (parsed.success) {
      return { ...parsed.data, _linha: idx + 2, _valida: true, _erros: [] }
    }
    return { ...row, _linha: idx + 2, _valida: false, _erros: parsed.error.issues.map((e) => e.message) } as CsvUserRowValidated
  })

  return NextResponse.json({ data: { rows: validatedRows } })
}

// Confirm user import
export async function PUT(request: NextRequest) {
  const session = await getSessionFromRequest(request)
  if (!session || session.perfil !== 'ADMIN') {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  let body: { rows: CsvUserRowValidated[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const validRows = body.rows.filter((r) => r._valida)
  const results = { created: 0, skipped: 0, errors: [] as string[] }

  for (const row of validRows) {
    const exists = await prisma.user.findUnique({ where: { matricula: row.matricula } })
    if (exists) { results.skipped++; continue }

    let lojaId: string | null = null
    if (row.loja) {
      const store = await prisma.store.findUnique({ where: { codigo: row.loja } })
      lojaId = store?.id ?? null
    }

    if (row.perfil === 'LOJA' && !lojaId) {
      results.errors.push(`Linha ${row._linha}: loja '${row.loja}' não encontrada`)
      continue
    }

    const tempPassword = generateTemporaryPassword()
    const hash = await hashPassword(tempPassword)

    await prisma.user.create({
      data: {
        matricula: row.matricula,
        nome: row.nome,
        email: row.email || null,
        senha_hash: hash,
        perfil: row.perfil as never,
        loja_id: lojaId,
        status: (row.status as never) ?? 'ATIVO',
        primeiro_acesso: true,
      },
    })
    results.created++
  }

  await createAuditLog({
    acao: AUDIT_ACTIONS.IMPORTACAO_USUARIOS,
    entidade: 'User',
    session,
    dadosNovos: results as unknown as Record<string, unknown>,
    request,
  })

  return NextResponse.json({ data: results })
}
