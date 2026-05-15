'use client'

import React, { useCallback, useEffect, useState } from 'react'
import { useRequireAuth } from '@/hooks/useSession'
import { PosterCard, type PosterCardData } from '@/components/posters/PosterCard'
import { Spinner } from '@/components/ui/Spinner'
import { Button } from '@/components/ui/Button'
import type { PosterStatus, PosterFormat } from '@/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FetchPostersParams {
  page: number
  status: string
  formato: string
  search: string
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos os status' },
  { value: 'RASCUNHO', label: 'Rascunho' },
  { value: 'AGUARDANDO_CONFERENCIA', label: 'Aguardando Conferência' },
  { value: 'APROVADA_PELA_LOJA', label: 'Aprovada pela Loja' },
  { value: 'PDF_GERADO', label: 'PDF Gerado' },
  { value: 'DOWNLOAD_REALIZADO', label: 'Download Realizado' },
  { value: 'CANCELADA', label: 'Cancelada' },
]

const FORMATO_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Todos os formatos' },
  { value: 'A4', label: 'A4' },
  { value: 'A6', label: 'A6' },
]

const PAGE_SIZE = 12

// ─── Filter bar ───────────────────────────────────────────────────────────────

function SelectFilter({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-medium text-[#64748B] sr-only">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className={[
          'rounded-lg border border-[#CBD5E1] bg-white px-3 py-2 text-sm text-[#334155]',
          "font-['Plus_Jakarta_Sans',sans-serif] min-h-[40px] transition-colors",
          'focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none appearance-none cursor-pointer',
        ].join(' ')}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  )
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({
  page,
  total,
  pageSize,
  onChange,
}: {
  page: number
  total: number
  pageSize: number
  onChange: (p: number) => void
}) {
  const totalPages = Math.ceil(total / pageSize)
  if (totalPages <= 1) return null

  const pages: number[] = []
  const start = Math.max(1, page - 2)
  const end = Math.min(totalPages, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <nav aria-label="Paginação" className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onChange(1)} className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#334155] hover:bg-[#F1F5F9] transition-colors">1</button>
          {start > 2 && <span className="text-[#94A3B8] px-1">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? 'page' : undefined}
          className={[
            'flex items-center justify-center w-9 h-9 rounded-lg border text-sm font-medium transition-colors',
            p === page
              ? 'border-[#E41513] bg-[#E41513] text-white'
              : 'border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F1F5F9]',
          ].join(' ')}
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-[#94A3B8] px-1">…</span>}
          <button onClick={() => onChange(totalPages)} className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#CBD5E1] bg-white text-sm text-[#334155] hover:bg-[#F1F5F9] transition-colors">{totalPages}</button>
        </>
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Próxima página"
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-[#CBD5E1] bg-white text-[#334155] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HistoryPage() {
  const { session, loading: sessionLoading, authorized } = useRequireAuth()

  const [posters, setPosters] = useState<PosterCardData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState('')
  const [formatoFilter, setFormatoFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 350)
    return () => clearTimeout(t)
  }, [searchQuery])

  const fetchPosters = useCallback(
    async ({ page, status, formato, search }: FetchPostersParams) => {
      setLoading(true)
      setError(null)
      try {
        const params = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
        if (status) params.set('status', status)
        if (formato) params.set('formato', formato)
        if (search) params.set('search', search)

        const res = await fetch(`/api/posters?${params.toString()}`, {
          credentials: 'include',
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Erro ao buscar pancartas')
        const body = await res.json()
        setPosters(body.data ?? [])
        setTotal(body.total ?? 0)
      } catch {
        setError('Não foi possível carregar as pancartas. Tente novamente.')
        setPosters([])
        setTotal(0)
      } finally {
        setLoading(false)
      }
    },
    []
  )

  // Fetch when filters or page change
  useEffect(() => {
    if (!authorized) return
    void fetchPosters({ page, status: statusFilter, formato: formatoFilter, search: debouncedSearch })
  }, [authorized, page, statusFilter, formatoFilter, debouncedSearch, fetchPosters])

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1)
  }, [statusFilter, formatoFilter, debouncedSearch])

  const handleStatusChange = (id: string, newStatus: PosterStatus) => {
    setPosters((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    )
  }

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }
  if (!authorized || !session) return null

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#0F172A] font-['Sora',sans-serif]">
              Histórico de Pancartas
            </h1>
            <p className="mt-1 text-sm text-[#64748B]">
              Pancartas disponíveis por 2 dias. Pancartas expiradas são removidas automaticamente.
            </p>
          </div>
          <a
            href="/posters/new"
            className={[
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all shrink-0',
              'bg-[#E41513] text-white hover:bg-[#C01211] shadow-sm',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
            ].join(' ')}
          >
            <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Nova pancarta
          </a>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <svg
                aria-hidden="true"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="search"
                aria-label="Buscar por descrição"
                placeholder="Buscar por descrição do produto…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={[
                  'w-full rounded-lg border border-[#CBD5E1] bg-white pl-9 pr-3.5 py-2 text-sm text-[#334155] placeholder:text-[#94A3B8]',
                  "font-['Plus_Jakarta_Sans',sans-serif] min-h-[40px] transition-colors",
                  'focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none',
                ].join(' ')}
              />
            </div>

            <SelectFilter
              id="statusFilter"
              label="Filtrar por status"
              value={statusFilter}
              options={STATUS_OPTIONS}
              onChange={setStatusFilter}
            />

            <SelectFilter
              id="formatoFilter"
              label="Filtrar por formato"
              value={formatoFilter}
              options={FORMATO_OPTIONS}
              onChange={setFormatoFilter}
            />

            {(statusFilter || formatoFilter || searchQuery) && (
              <Button
                variant="ghost"
                size="md"
                onClick={() => {
                  setStatusFilter('')
                  setFormatoFilter('')
                  setSearchQuery('')
                }}
              >
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Results summary */}
        {!loading && !error && (
          <p className="text-xs text-[#94A3B8] mb-4">
            {total === 0
              ? 'Nenhuma pancarta encontrada'
              : `${total} pancarta${total !== 1 ? 's' : ''} encontrada${total !== 1 ? 's' : ''}`}
          </p>
        )}

        {/* Error state */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-xl bg-[#FEE8E8] border border-[#FCA5A5] text-sm text-[#E41513] mb-6"
          >
            <svg aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="font-medium">{error}</p>
              <button
                onClick={() => fetchPosters({ page, status: statusFilter, formato: formatoFilter, search: debouncedSearch })}
                className="mt-1 underline text-xs hover:no-underline"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
                <div className="h-1 w-full bg-[#F1F5F9] shimmer" />
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex gap-2">
                    <div className="h-5 w-12 rounded-md bg-[#F1F5F9] shimmer" />
                    <div className="h-5 w-28 rounded-full bg-[#F1F5F9] shimmer" />
                  </div>
                  <div className="h-4 w-3/4 rounded bg-[#F1F5F9] shimmer" />
                  <div className="h-4 w-1/2 rounded bg-[#F1F5F9] shimmer" />
                  <div className="h-8 w-32 rounded-lg bg-[#F1F5F9] shimmer mt-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && posters.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#F1F5F9] flex items-center justify-center mb-4">
              <svg aria-hidden="true" className="w-8 h-8 text-[#CBD5E1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-[#334155] font-['Sora',sans-serif] mb-2">
              Nenhuma pancarta encontrada
            </h2>
            <p className="text-sm text-[#94A3B8] max-w-sm mb-6">
              {statusFilter || formatoFilter || searchQuery
                ? 'Tente ajustar os filtros para encontrar pancartas.'
                : 'Você ainda não criou nenhuma pancarta. Comece criando uma agora.'}
            </p>
            {!statusFilter && !formatoFilter && !searchQuery && (
              <a
                href="/posters/new"
                className={[
                  'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold',
                  'bg-[#E41513] text-white hover:bg-[#C01211] transition-colors shadow-sm',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
                ].join(' ')}
              >
                <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Criar nova pancarta
              </a>
            )}
          </div>
        )}

        {/* Cards grid */}
        {!loading && !error && posters.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {posters.map((poster) => (
                <PosterCard
                  key={poster.id}
                  poster={poster}
                  session={session}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>

            <Pagination
              page={page}
              total={total}
              pageSize={PAGE_SIZE}
              onChange={setPage}
            />
          </>
        )}
      </div>
    </main>
  )
}
