'use client'

import React, { useState } from 'react'
import { useRequireAuth } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import { CsvUploader } from '@/components/csv/CsvUploader'
import type { CsvUserRowValidated } from '@/types'

// ─── CSV template data URI ─────────────────────────────────────────────────────

const CSV_TEMPLATE_HEADER =
  'matricula,nome,email,loja,regional,perfil,status\n' +
  '12345,João da Silva,joao@empresa.com,001,,LOJA,ATIVO\n' +
  '99001,Maria Admin,,,,ADMIN,ATIVO\n'

const CSV_TEMPLATE_URI =
  'data:text/csv;charset=utf-8,' + encodeURIComponent(CSV_TEMPLATE_HEADER)

// ─── Validation table ─────────────────────────────────────────────────────────

interface ValidationTableProps {
  rows: CsvUserRowValidated[]
  onRemove: (linha: number) => void
}

function ValidationTable({ rows, onRemove }: ValidationTableProps) {
  const valid = rows.filter((r) => r._valida).length
  const invalid = rows.filter((r) => !r._valida).length

  return (
    <div className="flex flex-col gap-4">
      {/* Summary chips */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="text-sm font-medium text-[#334155]">
          {rows.length} linha{rows.length !== 1 ? 's' : ''} importada{rows.length !== 1 ? 's' : ''}
        </span>
        {valid > 0 && (
          <Badge variant="success">{valid} válida{valid !== 1 ? 's' : ''}</Badge>
        )}
        {invalid > 0 && (
          <Badge variant="error">{invalid} com erro{invalid !== 1 ? 's' : ''}</Badge>
        )}
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-[#E2E8F0] shadow-sm bg-white">
        <table className="min-w-full divide-y divide-[#F1F5F9] text-sm font-['Plus_Jakarta_Sans',sans-serif]">
          <thead className="bg-[#F8FAFC]">
            <tr>
              {['Linha', 'Matrícula', 'Nome', 'E-mail', 'Loja', 'Perfil', 'Status', ''].map(
                (h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap"
                  >
                    {h}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {rows.map((row) => (
              <tr
                key={row._linha}
                className={row._valida ? 'hover:bg-[#F8FAFC]' : 'bg-red-50 hover:bg-red-100'}
              >
                <td className="px-4 py-3 text-[#64748B] text-xs">{row._linha}</td>
                <td className="px-4 py-3">
                  <span className="font-mono text-xs">{row.matricula}</span>
                </td>
                <td className="px-4 py-3 text-[#334155]">{row.nome}</td>
                <td className="px-4 py-3 text-[#64748B] text-xs">{row.email ?? '—'}</td>
                <td className="px-4 py-3 text-[#64748B] text-xs">{row.loja ?? '—'}</td>
                <td className="px-4 py-3">
                  <Badge variant="neutral">{row.perfil}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={row.status === 'INATIVO' ? 'neutral' : 'success'}>
                    {row.status ?? 'ATIVO'}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  {row._valida ? (
                    <Badge variant="success">OK</Badge>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <Badge variant="error">Erro</Badge>
                      <ul className="text-[10px] text-red-600 list-disc pl-3 space-y-0.5 mt-1">
                        {row._erros.map((e, i) => (
                          <li key={i}>{e}</li>
                        ))}
                      </ul>
                      <button
                        onClick={() => onRemove(row._linha)}
                        className="mt-1 text-[10px] text-[#E41513] hover:underline text-left"
                        aria-label={`Remover linha ${row._linha}`}
                      >
                        Remover linha
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Result box ───────────────────────────────────────────────────────────────

interface ImportResult {
  created: number
  skipped: number
  errors: string[]
}

function ResultBox({ result }: { result: ImportResult }) {
  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 flex flex-col gap-3">
      <h3 className="font-semibold text-[#0F172A] text-base">Resultado da importação</h3>
      <div className="flex gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Badge variant="success">{result.created} criado{result.created !== 1 ? 's' : ''}</Badge>
        </div>
        {result.skipped > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="warning">
              {result.skipped} ignorado{result.skipped !== 1 ? 's' : ''} (duplicado)
            </Badge>
          </div>
        )}
        {result.errors.length > 0 && (
          <div className="flex items-center gap-2">
            <Badge variant="error">{result.errors.length} com erro</Badge>
          </div>
        )}
      </div>
      {result.errors.length > 0 && (
        <ul className="text-xs text-red-600 list-disc pl-4 space-y-0.5">
          {result.errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersImportPage() {
  const { authorized, loading: authLoading } = useRequireAuth({
    allowedProfiles: ['ADMIN'],
  })

  const { success, error: showError } = useToast()

  const [rows, setRows] = useState<CsvUserRowValidated[]>([])
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleUploadResult = (data: unknown) => {
    const d = data as { rows: CsvUserRowValidated[] }
    setRows(d.rows)
    setResult(null)
  }

  const handleRemoveRow = (linha: number) => {
    setRows((prev) => prev.filter((r) => r._linha !== linha))
  }

  const validRows = rows.filter((r) => r._valida)
  const hasValidRows = validRows.length > 0

  const handleConfirm = async () => {
    setConfirming(true)
    try {
      const res = await fetch('/api/admin/users/import', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rows }),
      })

      const body: { data?: ImportResult; error?: string } = await res.json()

      if (!res.ok) {
        showError(body.error ?? 'Erro ao importar usuários.')
        return
      }

      setResult(body.data!)
      setRows([])
      success(`Importação concluída: ${body.data!.created} usuário(s) criado(s).`)
    } catch {
      showError('Erro de conexão.')
    } finally {
      setConfirming(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      {/* Header info */}
      <div className="rounded-xl bg-blue-50 border border-blue-100 px-5 py-4 text-sm text-blue-700 flex flex-col gap-1">
        <p className="font-medium">Importação em massa de usuários via CSV</p>
        <p>
          Faça upload de um arquivo .csv com até 200 linhas. Revise os dados antes de confirmar a
          importação. Linhas inválidas podem ser removidas individualmente.
        </p>
        <a
          href={CSV_TEMPLATE_URI}
          download="modelo_usuarios.csv"
          className="mt-1 inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 underline underline-offset-2 font-medium w-fit"
        >
          <svg
            aria-hidden="true"
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Baixar modelo CSV
        </a>
      </div>

      {/* Uploader */}
      {rows.length === 0 && !result && (
        <CsvUploader
          endpoint="/api/admin/users/import"
          onResult={handleUploadResult}
          onError={(msg) => showError(msg)}
          label="Selecionar CSV de usuários"
        />
      )}

      {/* Validation table */}
      {rows.length > 0 && (
        <>
          <ValidationTable rows={rows} onRemove={handleRemoveRow} />

          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="ghost"
              onClick={() => setRows([])}
              disabled={confirming}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              loading={confirming}
              disabled={!hasValidRows}
              onClick={() => void handleConfirm()}
            >
              Importar {validRows.length} usuário{validRows.length !== 1 ? 's' : ''} válido{validRows.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </>
      )}

      {/* Result */}
      {result && (
        <>
          <ResultBox result={result} />
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setResult(null)}>
              Fazer nova importação
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
