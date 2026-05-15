'use client'

import React, { useState, useCallback } from 'react'
import { useRequireAuth } from '@/hooks/useSession'
import { CsvUploader } from '@/components/csv/CsvUploader'
import { CsvValidationTable } from '@/components/csv/CsvValidationTable'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import type { CsvPosterRowValidated } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UploadResult {
  importId: string
  rows: CsvPosterRowValidated[]
  linhasValidas: number
  linhasInvalidas: number
}

interface ConfirmResult {
  created: number
  ids: string[]
}

type PageStep = 1 | 2 | 3 | 4

// ─── Step indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Upload' },
  { id: 2, label: 'Revisar' },
  { id: 3, label: 'Aprovar' },
  { id: 4, label: 'PDF' },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Etapas de importação CSV">
      <ol className="flex items-center justify-center gap-0">
        {STEPS.map((step, idx) => {
          const isDone = step.id < current
          const isActive = step.id === current
          const isLast = idx === STEPS.length - 1

          return (
            <React.Fragment key={step.id}>
              <li className="flex flex-col items-center">
                <div
                  className={[
                    'flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-bold transition-all',
                    isDone
                      ? 'border-[#E41513] bg-[#E41513] text-white'
                      : isActive
                        ? 'border-[#E41513] bg-white text-[#E41513]'
                        : 'border-[#CBD5E1] bg-white text-[#94A3B8]',
                  ].join(' ')}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isDone ? (
                    <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span
                  className={[
                    'mt-1.5 text-xs font-medium whitespace-nowrap',
                    isActive ? 'text-[#E41513]' : isDone ? 'text-[#64748B]' : 'text-[#94A3B8]',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </li>
              {!isLast && (
                <div
                  aria-hidden="true"
                  className={[
                    'h-0.5 w-10 sm:w-16 mx-1 mt-[-14px] transition-colors',
                    step.id < current ? 'bg-[#E41513]' : 'bg-[#E2E8F0]',
                  ].join(' ')}
                />
              )}
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-[#0F172A] font-['Sora',sans-serif]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ImportPostersPage() {
  const { session, loading: sessionLoading, authorized } = useRequireAuth()
  const { success, error: showError } = useToast()

  const [step, setStep] = useState<PageStep>(1)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [rows, setRows] = useState<CsvPosterRowValidated[]>([])
  const [confirmResult, setConfirmResult] = useState<ConfirmResult | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isApprovingAll, setIsApprovingAll] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfId, setPdfId] = useState<string | null>(null)
  const [approvedCount, setApprovedCount] = useState(0)

  // ── Upload handler ──────────────────────────────────────────────────────────
  const handleUploadResult = useCallback((data: unknown) => {
    const result = data as UploadResult
    setUploadResult(result)
    setRows(result.rows)
    setStep(2)
    if (result.linhasInvalidas > 0) {
      showError(`${result.linhasInvalidas} linha(s) com erro. Corrija ou remova antes de confirmar.`)
    } else {
      success(`${result.linhasValidas} linha(s) válidas. Revise e confirme.`)
    }
  }, [success, showError])

  // ── Row update / remove ─────────────────────────────────────────────────────
  const handleRowUpdate = useCallback((index: number, field: string, value: string) => {
    setRows((prev) => {
      const updated = [...prev]
      const row = { ...updated[index]! }

      // Update the field
      ;(row as Record<string, unknown>)[field] = value

      // Re-validate the row client-side (basic checks)
      const erros: string[] = []
      if (!row.descricao_produto?.trim()) erros.push('Descrição obrigatória')
      if (!row.preco_loja?.trim()) erros.push('Preço loja obrigatório')
      if (!row.preco_app_site?.trim()) erros.push('Preço APP/SITE obrigatório')
      if (!row.ean?.trim()) erros.push('EAN obrigatório')
      else if (!/^\d+$/.test(row.ean)) erros.push('EAN deve ser numérico')
      if (!row.codigo_produto?.trim()) erros.push('Código do produto obrigatório')
      if (!row.data_validade?.trim()) erros.push('Data de validade obrigatória')
      else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(row.data_validade)) erros.push('Data inválida (use DD/MM/AAAA)')
      if (!row.canal_oferta?.trim()) erros.push('Canal da oferta obrigatório')
      if (!row.formato?.trim()) erros.push('Formato obrigatório (A4 ou A6)')
      else if (!['A4', 'A6'].includes(row.formato)) erros.push('Formato deve ser A4 ou A6')

      row._erros = erros
      row._valida = erros.length === 0
      updated[index] = row
      return updated
    })
  }, [])

  const handleRowRemove = useCallback((index: number) => {
    setRows((prev) => prev.filter((_, i) => i !== index))
  }, [])

  // ── Confirm import ──────────────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (!uploadResult || isConfirming) return

    const validRows = rows.filter((r) => r._valida)
    if (validRows.length === 0) {
      showError('Nenhuma linha válida para criar pancartas.')
      return
    }

    setIsConfirming(true)
    try {
      const res = await fetch('/api/posters/import', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ rows: validRows, importId: uploadResult.importId }),
      })

      const body = await res.json()
      if (!res.ok) {
        showError(body.error ?? 'Erro ao criar pancartas.')
        return
      }

      const result = body.data as ConfirmResult
      setConfirmResult(result)
      success(`${result.created} pancarta(s) criada(s) com sucesso!`)

      // For LOJA: go to approval step. For others: go to PDF step
      if (session?.perfil === 'LOJA') {
        setStep(3)
      } else {
        setStep(4)
      }
    } catch {
      showError('Erro de conexão. Tente novamente.')
    } finally {
      setIsConfirming(false)
    }
  }

  // ── Batch approve (LOJA) ────────────────────────────────────────────────────
  const handleApproveAll = async () => {
    if (!confirmResult || isApprovingAll) return
    setIsApprovingAll(true)

    let approved = 0
    let failed = 0

    // Approve each poster sequentially to avoid race conditions
    for (const id of confirmResult.ids) {
      try {
        const res = await fetch(`/api/posters/${id}/approve`, {
          method: 'POST',
          credentials: 'include',
        })
        if (res.ok) {
          approved++
        } else {
          failed++
        }
      } catch {
        failed++
      }
    }

    setApprovedCount(approved)

    if (failed > 0) {
      showError(`${approved} aprovadas, ${failed} com erro.`)
    } else {
      success(`${approved} pancarta(s) aprovadas! Agora você pode gerar o PDF.`)
    }

    if (approved > 0) {
      setStep(4)
    }

    setIsApprovingAll(false)
  }

  // ── Generate batch PDF ──────────────────────────────────────────────────────
  const handleGeneratePdf = async () => {
    if (!confirmResult || isGeneratingPdf) return
    setIsGeneratingPdf(true)

    // Use approved IDs (for LOJA flow) or all created IDs (for AREA_CENTRAL/ADMIN)
    const ids = confirmResult.ids

    try {
      const res = await fetch('/api/posters/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ posterIds: ids }),
      })

      const body = await res.json()
      if (!res.ok) {
        showError(body.error ?? 'Erro ao gerar PDF.')
        return
      }

      setPdfId(body.data?.id)
      success('PDF gerado com sucesso!')
    } catch {
      showError('Erro de conexão ao gerar PDF.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!authorized || !session) return null

  const isLoja = session.perfil === 'LOJA'
  const validCount = rows.filter((r) => r._valida).length

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Page header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1">
            <a
              href="/posters/history"
              className="text-sm text-[#64748B] hover:text-[#334155] transition-colors flex items-center gap-1"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Histórico
            </a>
          </div>
          <h1 className="text-2xl font-bold text-[#0F172A] font-['Sora',sans-serif]">
            Importar Pancartas via CSV
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Envie um arquivo CSV com até 200 linhas para criar pancartas em lote.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator current={step} />
        </div>

        <div className="flex flex-col gap-6">
          {/* ── Step 1: Upload ── */}
          {step === 1 && (
            <SectionCard
              title="Enviar arquivo CSV"
              subtitle="Selecione ou arraste um arquivo .csv com os dados das pancartas."
            >
              <CsvUploader
                endpoint="/api/posters/import"
                onResult={handleUploadResult}
                onError={showError}
                templateDownloadUrl="/templates/pancartas_modelo.csv"
                label="Arraste o arquivo CSV ou clique para selecionar"
                maxSizeMB={5}
              />

              {/* CSV format hint */}
              <div className="mt-5 p-4 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                  Cabeçalho esperado do CSV
                </p>
                <code className="text-xs text-[#334155] font-mono break-all leading-relaxed">
                  descricao_produto, preco_loja, preco_app_site, ean, codigo_produto, data_validade, canal_oferta, formato, loja, campanha
                </code>
              </div>
            </SectionCard>
          )}

          {/* ── Step 2: Review & edit ── */}
          {step === 2 && uploadResult && (
            <SectionCard
              title="Revisar linhas importadas"
              subtitle="Linhas com borda verde são válidas. Linhas com borda vermelha têm erros — edite ou remova antes de confirmar."
            >
              {/* Stats */}
              {uploadResult.linhasInvalidas > 0 && (
                <div
                  role="alert"
                  className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700"
                >
                  <svg aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">
                      {uploadResult.linhasInvalidas} linha(s) com erros de validação.
                    </p>
                    <p className="text-xs mt-0.5">
                      Corrija os campos inválidos clicando neles, ou remova as linhas problemáticas.
                      Somente linhas válidas serão criadas.
                    </p>
                  </div>
                </div>
              )}

              <CsvValidationTable
                rows={rows}
                onRowUpdate={handleRowUpdate}
                onRowRemove={handleRowRemove}
                onConfirm={handleConfirm}
                isConfirming={isConfirming}
              />

              {/* Back button */}
              <div className="mt-4 flex justify-start">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep(1)
                    setUploadResult(null)
                    setRows([])
                  }}
                  disabled={isConfirming}
                >
                  <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  Enviar outro arquivo
                </Button>
              </div>
            </SectionCard>
          )}

          {/* ── Step 3: Batch approve (LOJA only) ── */}
          {step === 3 && confirmResult && isLoja && (
            <SectionCard
              title="Conferir e aprovar lote"
              subtitle={`${confirmResult.created} pancarta(s) criada(s). Como usuária da loja, você deve aprovar o lote antes de gerar o PDF.`}
            >
              {/* Summary */}
              <div className="flex items-center gap-3 mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 shrink-0">
                  <svg aria-hidden="true" className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    {confirmResult.created} pancarta(s) aguardando aprovação
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Revise os dados importados e clique em "Aprovar lote" para liberar a geração do PDF.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  loading={isApprovingAll}
                  onClick={handleApproveAll}
                >
                  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {isApprovingAll
                    ? 'Aprovando lote…'
                    : `Conferir e Aprovar ${confirmResult.created} pancarta(s)`}
                </Button>

                <a
                  href="/posters/history"
                  className={[
                    'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                    'bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F1F5F9]',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
                  ].join(' ')}
                >
                  Aprovar depois no histórico
                </a>
              </div>
            </SectionCard>
          )}

          {/* ── Step 4: Generate PDF ── */}
          {step === 4 && confirmResult && (
            <SectionCard
              title={pdfId ? 'PDF pronto para download' : 'Gerar PDF do lote'}
              subtitle={
                pdfId
                  ? 'Seu PDF foi gerado e está disponível por 2 dias.'
                  : isLoja
                    ? `${approvedCount} pancarta(s) aprovada(s). Gere o PDF do lote.`
                    : `${confirmResult.created} pancarta(s) criadas. Gere o PDF do lote.`
              }
            >
              {pdfId ? (
                <>
                  {/* Success state */}
                  <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 shrink-0">
                      <svg aria-hidden="true" className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <p className="text-sm font-semibold text-emerald-700">PDF gerado com sucesso!</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={`/api/pdfs/${pdfId}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={[
                        'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all',
                        'bg-[#E41513] text-white hover:bg-[#C01211] shadow-sm',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
                      ].join(' ')}
                    >
                      <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Baixar PDF
                    </a>

                    <a
                      href="/posters/history"
                      className={[
                        'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                        'bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F1F5F9]',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
                      ].join(' ')}
                    >
                      <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Ver histórico
                    </a>

                    <a
                      href="/posters/import"
                      className={[
                        'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                        'bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F1F5F9]',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
                      ].join(' ')}
                    >
                      <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      Nova importação
                    </a>
                  </div>
                </>
              ) : (
                <>
                  {/* Created IDs list */}
                  <div className="mb-5 p-4 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]">
                    <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">
                      IDs das pancartas criadas
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {confirmResult.ids.slice(0, 20).map((id) => (
                        <code key={id} className="text-xs bg-white border border-[#E2E8F0] px-2 py-0.5 rounded text-[#334155]">
                          {id.slice(0, 8)}…
                        </code>
                      ))}
                      {confirmResult.ids.length > 20 && (
                        <span className="text-xs text-[#94A3B8] self-center">
                          +{confirmResult.ids.length - 20} mais
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button
                      variant="primary"
                      size="lg"
                      loading={isGeneratingPdf}
                      onClick={handleGeneratePdf}
                    >
                      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {isGeneratingPdf ? 'Gerando PDF do lote…' : `Gerar PDF — ${confirmResult.created} pancarta(s)`}
                    </Button>

                    <a
                      href="/posters/history"
                      className={[
                        'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                        'bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F1F5F9]',
                        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
                      ].join(' ')}
                    >
                      Gerar depois no histórico
                    </a>
                  </div>
                </>
              )}
            </SectionCard>
          )}
        </div>
      </div>
    </main>
  )
}
