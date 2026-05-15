'use client'

import React, { useState } from 'react'
import { useRequireAuth } from '@/hooks/useSession'
import { PosterForm, type CreatedPoster } from '@/components/posters/PosterForm'
import { PosterPreview } from '@/components/posters/PosterPreview'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'
import type { PosterStatus } from '@/types'

// ─── Step Indicator ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Preencher' },
  { id: 2, label: 'Revisar' },
  { id: 3, label: 'Aprovar' },
  { id: 4, label: 'PDF' },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <nav aria-label="Etapas de criação" className="w-full">
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

// ─── Page ─────────────────────────────────────────────────────────────────────

type PageStep = 1 | 2 | 3 | 4

interface PdfResult {
  id: string
  filename: string
  expiraEm: string
}

export default function NewPosterPage() {
  const { session, loading, authorized } = useRequireAuth()
  const { success, error: showError } = useToast()

  const [step, setStep] = useState<PageStep>(1)
  const [createdPoster, setCreatedPoster] = useState<CreatedPoster | null>(null)
  const [posterStatus, setPosterStatus] = useState<PosterStatus>('RASCUNHO')
  const [posterId, setPosterId] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfResult, setPdfResult] = useState<PdfResult | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!authorized || !session) return null

  const isLoja = session.perfil === 'LOJA'

  const handleFormSuccess = (poster: CreatedPoster) => {
    setCreatedPoster(poster)
    setPosterId(poster.id)
    // LOJA goes straight to AGUARDANDO_CONFERENCIA per backend logic
    setPosterStatus(isLoja ? 'AGUARDANDO_CONFERENCIA' : 'RASCUNHO')
    setStep(2)
  }

  const handleApprove = async () => {
    if (!posterId || isApproving) return
    setIsApproving(true)
    try {
      const res = await fetch(`/api/posters/${posterId}/approve`, {
        method: 'POST',
        credentials: 'include',
      })
      const body = await res.json()
      if (!res.ok) {
        showError(body.error ?? 'Erro ao aprovar pancarta.')
        return
      }
      setPosterStatus('APROVADA_PELA_LOJA')
      success('Pancarta aprovada! Agora você pode gerar o PDF.')
      setStep(3)
    } catch {
      showError('Erro de conexão. Tente novamente.')
    } finally {
      setIsApproving(false)
    }
  }

  const handleGeneratePdf = async () => {
    if (!posterId || isGeneratingPdf) return
    setIsGeneratingPdf(true)
    try {
      const res = await fetch('/api/posters/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ posterIds: [posterId] }),
      })
      const body = await res.json()
      if (!res.ok) {
        showError(body.error ?? 'Erro ao gerar PDF.')
        return
      }
      setPdfResult(body.data)
      setPosterStatus('PDF_GERADO')
      success('PDF gerado com sucesso!')
      setStep(4)
    } catch {
      showError('Erro de conexão. Tente novamente.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // For AREA_CENTRAL / ADMIN: can generate PDF directly from RASCUNHO (step 2 → 4)
  const canSkipApproval = !isLoja && (posterStatus === 'RASCUNHO' || posterStatus === 'APROVADA_PELA_LOJA')

  return (
    <div className="max-w-3xl flex flex-col gap-6">
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
            Nova Pancarta
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Crie uma pancarta promocional manualmente.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator current={step} />
        </div>

        {/* ── Step 1: Form ── */}
        {step === 1 && (
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm" style={{ padding: '20px' }}>
            <h2 className="text-lg font-semibold text-[#0F172A] font-['Sora',sans-serif] mb-5">
              Dados da Pancarta
            </h2>
            <PosterForm session={session} onSuccess={handleFormSuccess} />
          </div>
        )}

        {/* ── Step 2: Preview + Approve / Generate ── */}
        {step >= 2 && createdPoster && (
          <div className="flex flex-col gap-6">
            {/* Preview card */}
            <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm" style={{ padding: '20px' }}>
              <h2 className="text-lg font-semibold text-[#0F172A] font-['Sora',sans-serif] mb-5">
                Pré-visualização
              </h2>
              <div className="flex justify-center">
                <PosterPreview
                  poster={{
                    descricaoProduto: createdPoster.descricao_produto,
                    precoLoja: createdPoster.preco_loja,
                    precoAppSite: createdPoster.preco_app_site,
                    textoLegal: createdPoster.texto_legal,
                    formato: createdPoster.template?.formato ?? createdPoster.formato ?? 'A4',
                  }}
                />
              </div>
            </div>

            {/* Action panel */}
            {step < 4 && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm" style={{ padding: '20px' }}>
                <h2 className="text-lg font-semibold text-[#0F172A] font-['Sora',sans-serif] mb-2">
                  {isLoja
                    ? posterStatus === 'AGUARDANDO_CONFERENCIA'
                      ? 'Conferir e Aprovar'
                      : posterStatus === 'APROVADA_PELA_LOJA'
                        ? 'Gerar PDF'
                        : 'Próximo passo'
                    : 'Gerar PDF'}
                </h2>
                <p className="text-sm text-[#64748B] mb-5">
                  {isLoja
                    ? posterStatus === 'AGUARDANDO_CONFERENCIA'
                      ? 'Revise os dados acima com atenção. Ao aprovar, o sistema liberará a geração do PDF.'
                      : posterStatus === 'APROVADA_PELA_LOJA'
                        ? 'Pancarta aprovada. Clique em "Gerar PDF" para criar o arquivo para impressão.'
                        : ''
                    : 'Como membro da área central, você pode gerar o PDF diretamente.'}
                </p>

                <div className="flex flex-wrap gap-3">
                  {/* Edit button */}
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setStep(1)}
                    disabled={isApproving || isGeneratingPdf || posterStatus === 'APROVADA_PELA_LOJA' || posterStatus === 'PDF_GERADO'}
                  >
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar dados
                  </Button>

                  {/* LOJA: Approve */}
                  {isLoja && posterStatus === 'AGUARDANDO_CONFERENCIA' && (
                    <Button
                      variant="primary"
                      size="lg"
                      loading={isApproving}
                      onClick={handleApprove}
                    >
                      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {isApproving ? 'Aprovando…' : 'Conferir e Aprovar'}
                    </Button>
                  )}

                  {/* LOJA: Generate PDF after approval */}
                  {isLoja && posterStatus === 'APROVADA_PELA_LOJA' && (
                    <Button
                      variant="primary"
                      size="lg"
                      loading={isGeneratingPdf}
                      onClick={handleGeneratePdf}
                    >
                      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {isGeneratingPdf ? 'Gerando PDF…' : 'Gerar PDF'}
                    </Button>
                  )}

                  {/* AREA_CENTRAL / ADMIN: Generate PDF directly */}
                  {canSkipApproval && (
                    <Button
                      variant="primary"
                      size="lg"
                      loading={isGeneratingPdf}
                      onClick={handleGeneratePdf}
                    >
                      <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      {isGeneratingPdf ? 'Gerando PDF…' : 'Gerar PDF'}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* ── Step 4: PDF ready ── */}
            {step === 4 && pdfResult && (
              <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm" style={{ padding: '20px' }}>
                {/* Success banner */}
                <div className="flex items-center gap-3 mb-5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 shrink-0">
                    <svg aria-hidden="true" className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-emerald-700">PDF gerado com sucesso!</p>
                    <p className="text-xs text-emerald-600 mt-0.5">
                      Disponível por 2 dias — {pdfResult.filename}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    href={`/api/pdfs/${pdfResult.id}/download`}
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
                    href="/posters/new"
                    className={[
                      'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all',
                      'bg-white text-[#334155] border border-[#CBD5E1] hover:bg-[#F1F5F9]',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
                    ].join(' ')}
                  >
                    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                    Nova pancarta
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  )
}
