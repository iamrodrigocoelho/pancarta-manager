'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/components/ui/Toast'
import type { PosterStatus, PosterFormat, SessionUser } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PosterCardData {
  id: string
  descricao_produto: string
  preco_loja: string
  preco_app_site: string
  campanha?: string | null
  criado_em: string
  expira_em?: string | null
  status: PosterStatus
  template?: { formato: PosterFormat; nome: string } | null
  store?: { codigo: string; nome: string } | null
  criador?: { matricula: string; nome: string } | null
  pdf_file?: { id: string; expira_em: string; status: string } | null
}

interface PosterCardProps {
  poster: PosterCardData
  session: SessionUser
  onStatusChange?: (id: string, newStatus: PosterStatus) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `há ${days}d`
  if (hours > 0) return `há ${hours}h`
  if (minutes > 0) return `há ${minutes}min`
  return 'agora mesmo'
}

function formatExpirationCountdown(expiresAt: string): { label: string; urgent: boolean } {
  const remaining = new Date(expiresAt).getTime() - Date.now()
  if (remaining <= 0) return { label: 'Expirado', urgent: true }

  const totalMinutes = Math.floor(remaining / 60_000)
  const hours = Math.floor(totalMinutes / 60)
  const days = Math.floor(hours / 24)
  const remHours = hours % 24

  if (days > 0) {
    const label = remHours > 0 ? `Expira em ${days}d ${remHours}h` : `Expira em ${days}d`
    return { label, urgent: days < 1 }
  }
  const mins = totalMinutes % 60
  const label = hours > 0 ? `Expira em ${hours}h ${mins}min` : `Expira em ${mins}min`
  return { label, urgent: hours < 4 }
}

function formatoBadgeClass(formato: PosterFormat | undefined): string {
  if (formato === 'A4') return 'bg-blue-50 text-blue-700 ring-1 ring-blue-200'
  if (formato === 'A6') return 'bg-purple-50 text-purple-700 ring-1 ring-purple-200'
  return 'bg-[#F3F4F6] text-[#6B7280] ring-1 ring-[#E5E7EB]'
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PosterCard({ poster, session, onStatusChange }: PosterCardProps) {
  const { success, error: showError } = useToast()
  const [isApproving, setIsApproving] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [localStatus, setLocalStatus] = useState<PosterStatus>(poster.status)
  const [localPdfId, setLocalPdfId] = useState<string | null>(poster.pdf_file?.id ?? null)

  const formato = poster.template?.formato
  const expirationInfo = poster.expira_em ? formatExpirationCountdown(poster.expira_em) : null

  const canApprove =
    localStatus === 'AGUARDANDO_CONFERENCIA' &&
    (session.perfil === 'LOJA' || session.perfil === 'ADMIN' || session.perfil === 'AREA_CENTRAL')

  const canGeneratePdf =
    localStatus === 'APROVADA_PELA_LOJA' ||
    (localStatus === 'RASCUNHO' && session.perfil !== 'LOJA')

  const canDownload =
    (localStatus === 'PDF_GERADO' || localStatus === 'DOWNLOAD_REALIZADO') && localPdfId

  const handleApprove = async () => {
    if (isApproving) return
    setIsApproving(true)
    try {
      const res = await fetch(`/api/posters/${poster.id}/approve`, {
        method: 'POST',
        credentials: 'include',
      })
      const body = await res.json()
      if (!res.ok) {
        showError(body.error ?? 'Erro ao aprovar pancarta.')
        return
      }
      const newStatus: PosterStatus = 'APROVADA_PELA_LOJA'
      setLocalStatus(newStatus)
      onStatusChange?.(poster.id, newStatus)
      success('Pancarta aprovada com sucesso!')
    } catch {
      showError('Erro de conexão. Tente novamente.')
    } finally {
      setIsApproving(false)
    }
  }

  const handleGeneratePdf = async () => {
    if (isGeneratingPdf) return
    setIsGeneratingPdf(true)
    try {
      const res = await fetch('/api/posters/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ posterIds: [poster.id] }),
      })
      const body = await res.json()
      if (!res.ok) {
        showError(body.error ?? 'Erro ao gerar PDF.')
        return
      }
      const pdfId: string = body.data?.id
      setLocalPdfId(pdfId)
      const newStatus: PosterStatus = 'PDF_GERADO'
      setLocalStatus(newStatus)
      onStatusChange?.(poster.id, newStatus)
      success('PDF gerado com sucesso!')
    } catch {
      showError('Erro de conexão. Tente novamente.')
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  return (
    <div
      className={[
        'relative bg-white rounded-xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md',
        localStatus === 'EXPIRADA' || localStatus === 'CANCELADA'
          ? 'border-[#E5E7EB] opacity-60'
          : 'border-[#E5E7EB]',
      ].join(' ')}
    >
      {/* Top accent bar by status */}
      <div
        className={[
          'h-1 w-full',
          localStatus === 'AGUARDANDO_CONFERENCIA' ? 'bg-amber-400' :
          localStatus === 'APROVADA_PELA_LOJA' ? 'bg-emerald-500' :
          localStatus === 'PDF_GERADO' ? 'bg-blue-500' :
          localStatus === 'DOWNLOAD_REALIZADO' ? 'bg-indigo-500' :
          localStatus === 'EXPIRADA' ? 'bg-[#D1D5DB]' :
          localStatus === 'CANCELADA' ? 'bg-red-400' :
          'bg-[#C41E3A]',
        ].join(' ')}
        aria-hidden="true"
      />

      <div className="px-4 py-4">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            {/* Formato badge */}
            {formato && (
              <span
                className={[
                  'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold tracking-wider',
                  formatoBadgeClass(formato),
                ].join(' ')}
              >
                {formato}
              </span>
            )}
            {/* Status badge */}
            <Badge status={localStatus} />
          </div>

          {/* Expiration countdown */}
          {expirationInfo && localStatus !== 'EXPIRADA' && localStatus !== 'CANCELADA' && (
            <span
              className={[
                'shrink-0 text-xs font-medium px-2 py-0.5 rounded-full',
                expirationInfo.urgent
                  ? 'bg-red-50 text-red-600 ring-1 ring-red-200'
                  : 'bg-[#F3F4F6] text-[#6B7280]',
              ].join(' ')}
            >
              {expirationInfo.label}
            </span>
          )}
        </div>

        {/* Product description */}
        <h3 className="text-sm font-semibold text-[#111827] leading-snug mb-2 line-clamp-2 font-['Sora',sans-serif]">
          {poster.descricao_produto}
        </h3>

        {/* Prices */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex flex-col">
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">Preço Loja</span>
            <span className="text-sm font-medium text-[#374151]">R$ {poster.preco_loja}</span>
          </div>
          <div className="w-px h-8 bg-[#E5E7EB]" aria-hidden="true" />
          <div className="flex flex-col">
            <span className="text-[10px] text-[#9CA3AF] uppercase tracking-wider">APP/SITE</span>
            <span className="text-sm font-bold text-[#B8860B]">R$ {poster.preco_app_site}</span>
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mb-4 text-xs text-[#6B7280]">
          {/* Loja (for non-LOJA users) */}
          {poster.store && session.perfil !== 'LOJA' && (
            <span className="flex items-center gap-1">
              <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h18l-2 9H5L3 3zM5 12v9h14v-9" />
              </svg>
              {poster.store.codigo} — {poster.store.nome}
            </span>
          )}
          {/* Campanha */}
          {poster.campanha && (
            <span className="flex items-center gap-1">
              <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              {poster.campanha}
            </span>
          )}
          {/* Created by / when */}
          <span className="flex items-center gap-1">
            <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {poster.criador ? `${poster.criador.nome} · ` : ''}{formatRelativeTime(poster.criado_em)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          {canApprove && (
            <Button
              variant="primary"
              size="sm"
              loading={isApproving}
              onClick={handleApprove}
              className="flex-1 sm:flex-none"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {isApproving ? 'Aprovando…' : 'Conferir e Aprovar'}
            </Button>
          )}

          {canGeneratePdf && !canApprove && (
            <Button
              variant="secondary"
              size="sm"
              loading={isGeneratingPdf}
              onClick={handleGeneratePdf}
              className="flex-1 sm:flex-none"
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {isGeneratingPdf ? 'Gerando PDF…' : 'Gerar PDF'}
            </Button>
          )}

          {canDownload && localPdfId && (
            <a
              href={`/api/pdfs/${localPdfId}/download`}
              target="_blank"
              rel="noopener noreferrer"
              className={[
                'inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-md font-medium transition-all',
                'bg-white text-[#374151] border border-[#D1D5DB] hover:bg-[#F3F4F6] hover:border-[#9CA3AF]',
                'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C41E3A] focus-visible:outline-offset-2',
              ].join(' ')}
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Baixar PDF
            </a>
          )}

          {localStatus === 'EXPIRADA' && (
            <span className="text-xs text-[#9CA3AF] italic py-1">Pancarta expirada</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default PosterCard
