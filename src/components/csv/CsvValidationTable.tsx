'use client'

import React, { useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import type { CsvPosterRowValidated } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CsvValidationTableProps {
  rows: CsvPosterRowValidated[]
  onRowUpdate: (index: number, field: string, value: string) => void
  onRowRemove: (index: number) => void
  onConfirm: () => void
  isConfirming?: boolean
}

// ─── Constants ────────────────────────────────────────────────────────────────

const FIELDS: { key: keyof CsvPosterRowValidated; label: string; width: string; editable: boolean }[] = [
  { key: 'descricao_produto', label: 'Descrição', width: 'min-w-[200px]', editable: true },
  { key: 'preco_loja', label: 'Preço Loja', width: 'min-w-[100px]', editable: true },
  { key: 'preco_app_site', label: 'Preço APP', width: 'min-w-[100px]', editable: true },
  { key: 'ean', label: 'EAN', width: 'min-w-[120px]', editable: true },
  { key: 'codigo_produto', label: 'Cód. Produto', width: 'min-w-[120px]', editable: true },
  { key: 'data_validade', label: 'Data Validade', width: 'min-w-[120px]', editable: true },
  { key: 'canal_oferta', label: 'Canal', width: 'min-w-[100px]', editable: true },
  { key: 'formato', label: 'Formato', width: 'min-w-[80px]', editable: true },
  { key: 'campanha', label: 'Campanha', width: 'min-w-[130px]', editable: true },
]

const PAGE_SIZE = 20

// ─── Inline editable cell ─────────────────────────────────────────────────────

interface EditableCellProps {
  value: string | undefined
  fieldKey: string
  rowIndex: number
  onUpdate: (index: number, field: string, value: string) => void
}

function EditableCell({ value, fieldKey, rowIndex, onUpdate }: EditableCellProps) {
  const [editing, setEditing] = useState(false)
  const [localValue, setLocalValue] = useState(value ?? '')

  const handleBlur = () => {
    setEditing(false)
    if (localValue !== (value ?? '')) {
      onUpdate(rowIndex, fieldKey, localValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur()
    }
    if (e.key === 'Escape') {
      setLocalValue(value ?? '')
      setEditing(false)
    }
  }

  if (editing) {
    return (
      <input
        autoFocus
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        aria-label={`Editar campo ${fieldKey} da linha ${rowIndex + 1}`}
        className={[
          'w-full min-w-[80px] px-2 py-1 rounded border text-xs text-[#0F172A]',
          "font-['Plus_Jakarta_Sans',sans-serif] bg-white",
          'border-[#E41513] ring-2 ring-[#E41513]/20 outline-none',
        ].join(' ')}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setLocalValue(value ?? '')
        setEditing(true)
      }}
      title="Clique para editar"
      aria-label={`Editar campo ${fieldKey}: ${value ?? '(vazio)'}`}
      className={[
        'w-full text-left px-2 py-1 rounded text-xs transition-colors group',
        value
          ? 'text-[#0F172A] hover:bg-[#F1F5F9]'
          : 'text-[#94A3B8] italic hover:bg-[#F1F5F9]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513]',
      ].join(' ')}
    >
      <span className="flex items-center gap-1">
        <span className="truncate max-w-[200px]">{value || '—'}</span>
        <svg
          aria-hidden="true"
          className="w-3 h-3 shrink-0 opacity-0 group-hover:opacity-50 transition-opacity"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </span>
    </button>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CsvValidationTable({
  rows,
  onRowUpdate,
  onRowRemove,
  onConfirm,
  isConfirming = false,
}: CsvValidationTableProps) {
  const [page, setPage] = useState(1)
  const [showOnlyInvalid, setShowOnlyInvalid] = useState(false)

  const validCount = rows.filter((r) => r._valida).length
  const invalidCount = rows.length - validCount
  const hasValidRows = validCount > 0

  const displayedRows = showOnlyInvalid ? rows.filter((r) => !r._valida) : rows
  const totalPages = Math.ceil(displayedRows.length / PAGE_SIZE)
  const pageRows = displayedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Map back to original index for edit/remove callbacks
  const getOriginalIndex = useCallback(
    (displayRow: CsvPosterRowValidated) => rows.indexOf(displayRow),
    [rows]
  )

  const handleFilterChange = (onlyInvalid: boolean) => {
    setShowOnlyInvalid(onlyInvalid)
    setPage(1)
  }

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
        <svg aria-hidden="true" className="w-10 h-10 text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-[#64748B]">Nenhuma linha para exibir.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Total */}
          <span className="text-sm font-medium text-[#334155]">
            {rows.length} linha{rows.length !== 1 ? 's' : ''}
          </span>

          {/* Valid badge */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
            {validCount} válida{validCount !== 1 ? 's' : ''}
          </span>

          {/* Invalid badge */}
          {invalidCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 ring-1 ring-red-200">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" aria-hidden="true" />
              {invalidCount} inválida{invalidCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* Filter + Confirm */}
        <div className="flex items-center gap-2 flex-wrap">
          {invalidCount > 0 && (
            <button
              type="button"
              onClick={() => handleFilterChange(!showOnlyInvalid)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                showOnlyInvalid
                  ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                  : 'bg-white border-[#CBD5E1] text-[#64748B] hover:border-[#E41513] hover:text-[#E41513]',
              ].join(' ')}
            >
              {showOnlyInvalid ? 'Mostrar todas' : 'Ver somente inválidas'}
            </button>
          )}

          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!hasValidRows}
            loading={isConfirming}
            onClick={onConfirm}
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {isConfirming ? 'Criando…' : `Confirmar e Criar ${validCount} Pancarta${validCount !== 1 ? 's' : ''}`}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="w-full overflow-x-auto rounded-xl border border-[#E2E8F0] shadow-sm">
        <table className="min-w-full text-sm font-['Plus_Jakarta_Sans',sans-serif]">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th scope="col" className="sticky left-0 z-10 bg-[#F8FAFC] px-3 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap w-12">
                Linha
              </th>
              {FIELDS.map((f) => (
                <th key={f.key} scope="col" className={`px-3 py-2.5 text-left text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap ${f.width}`}>
                  {f.label}
                </th>
              ))}
              <th scope="col" className="px-3 py-2.5 text-right text-xs font-semibold text-[#64748B] uppercase tracking-wider whitespace-nowrap w-16">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-[#F1F5F9]">
            {pageRows.map((row) => {
              const origIdx = getOriginalIndex(row)
              const isValid = row._valida

              return (
                <React.Fragment key={`row-${row._linha}`}>
                  <tr
                    className={[
                      'transition-colors',
                      isValid
                        ? 'border-l-4 border-l-emerald-400 hover:bg-[#F8FAFC]'
                        : 'border-l-4 border-l-red-400 bg-red-50/30 hover:bg-red-50/50',
                    ].join(' ')}
                  >
                    {/* Line number */}
                    <td className="sticky left-0 z-10 px-3 py-2 whitespace-nowrap">
                      <span
                        className={[
                          'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold',
                          isValid ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700',
                        ].join(' ')}
                      >
                        {row._linha}
                      </span>
                    </td>

                    {/* Editable fields */}
                    {FIELDS.map((f) => (
                      <td key={f.key} className={`px-1 py-1 align-middle ${f.width}`}>
                        {f.editable ? (
                          <EditableCell
                            value={row[f.key] as string | undefined}
                            fieldKey={f.key}
                            rowIndex={origIdx}
                            onUpdate={onRowUpdate}
                          />
                        ) : (
                          <span className="text-xs text-[#334155] px-2">{row[f.key] as string ?? '—'}</span>
                        )}
                      </td>
                    ))}

                    {/* Remove button */}
                    <td className="px-3 py-2 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          onRowRemove(origIdx)
                          if (pageRows.length === 1 && page > 1) setPage(page - 1)
                        }}
                        aria-label={`Remover linha ${row._linha}`}
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[#94A3B8] hover:text-[#DC2626] hover:bg-red-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#DC2626]"
                      >
                        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </td>
                  </tr>

                  {/* Error messages for invalid rows */}
                  {!isValid && row._erros.length > 0 && (
                    <tr
                      className="bg-red-50/40 border-l-4 border-l-red-400"
                      aria-label={`Erros da linha ${row._linha}`}
                    >
                      <td colSpan={FIELDS.length + 2} className="px-4 py-2">
                        <ul className="flex flex-wrap gap-x-4 gap-y-1">
                          {row._erros.map((err, i) => (
                            <li key={i} className="flex items-center gap-1 text-xs text-red-600">
                              <svg aria-hidden="true" className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              {err}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-xs text-[#94A3B8]">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, displayedRows.length)} de {displayedRows.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              aria-label="Página anterior"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => Math.abs(p - page) <= 2)
              .map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={p === page ? 'page' : undefined}
                  className={[
                    'flex items-center justify-center w-8 h-8 rounded-lg border text-xs font-medium transition-colors',
                    p === page
                      ? 'border-[#E41513] bg-[#E41513] text-white'
                      : 'border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F1F5F9]',
                  ].join(' ')}
                >
                  {p}
                </button>
              ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              aria-label="Próxima página"
              className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Bottom confirm */}
      {rows.length > PAGE_SIZE && (
        <div className="flex justify-end pt-2 border-t border-[#E2E8F0]">
          <Button
            type="button"
            variant="primary"
            size="md"
            disabled={!hasValidRows}
            loading={isConfirming}
            onClick={onConfirm}
          >
            {isConfirming ? 'Criando pancartas…' : `Confirmar e Criar ${validCount} Pancarta${validCount !== 1 ? 's' : ''}`}
          </Button>
        </div>
      )}
    </div>
  )
}

export default CsvValidationTable
