'use client'

import React from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PosterPreviewProps {
  poster: {
    descricaoProduto: string
    precoLoja: string
    precoAppSite: string
    textoLegal: string
    formato: 'A4' | 'A6'
  }
  className?: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

// A4: 210x297mm ratio = 0.707. A6: 105x148mm ratio = 0.709 (same ratio, half size)
// We'll display A4 at a fixed max width and A6 proportionally smaller.
const FORMAT_CONFIG = {
  A4: {
    widthPx: 340,
    aspectRatio: 210 / 297, // ~0.707
    label: 'A4 — 210 × 297 mm',
  },
  A6: {
    widthPx: 260,
    aspectRatio: 148 / 105, // A6 landscape-ish; actual A6 portrait = 105x148 → 0.709
    // We keep portrait: width/height = 105/148 ≈ 0.709
    label: 'A6 — 105 × 148 mm',
  },
}

// Zone heights as fraction of total height
const ZONES = {
  header: 0.12,   // red header at top
  descricao: 0.22, // white zone for product description
  preco: 0.16,    // white zone for store price
  app: 0.30,      // yellow zone for APP price (highlight)
  footer: 0.20,   // dark footer for legal text
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PosterPreview({ poster, className = '' }: PosterPreviewProps) {
  const { descricaoProduto, precoLoja, precoAppSite, textoLegal, formato } = poster
  const cfg = FORMAT_CONFIG[formato]

  const widthPx = cfg.widthPx
  const heightPx = Math.round(widthPx / (formato === 'A4' ? 210 / 297 : 105 / 148))

  // Zone heights in px
  const headerH = Math.round(heightPx * ZONES.header)
  const descricaoH = Math.round(heightPx * ZONES.descricao)
  const precoH = Math.round(heightPx * ZONES.preco)
  const appH = Math.round(heightPx * ZONES.app)
  const footerH = heightPx - headerH - descricaoH - precoH - appH

  // Font sizes scaled to preview size
  const baseFontScale = widthPx / 340
  const descFontSize = Math.round(14 * baseFontScale)
  const precoLojaFontSize = Math.round(13 * baseFontScale)
  const precoAppFontSize = Math.round(44 * baseFontScale)
  const legalFontSize = Math.round(7.5 * baseFontScale)

  return (
    <div className={['flex flex-col items-center gap-3', className].join(' ')}>
      {/* Preview badge */}
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3F4F6] border border-[#E5E7EB] text-xs font-medium text-[#6B7280]">
          <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Pré-visualização — {cfg.label}
        </span>
      </div>

      {/* Poster canvas */}
      <div
        role="img"
        aria-label={`Pré-visualização da pancarta ${formato} — ${descricaoProduto}`}
        style={{
          width: widthPx,
          height: heightPx,
          fontFamily: "'DM Sans', Arial, sans-serif",
        }}
        className="relative overflow-hidden rounded-lg shadow-xl border border-[#E5E7EB] select-none"
      >
        {/* ── Header zone (red brand bar) ── */}
        <div
          style={{ height: headerH }}
          className="w-full bg-[#C41E3A] flex items-center justify-between px-3"
        >
          {/* Logo placeholder */}
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-white/20 border border-white/30 flex items-center justify-center">
              <svg aria-hidden="true" className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
              </svg>
            </div>
            <span style={{ fontSize: Math.round(8 * baseFontScale) }} className="text-white font-bold tracking-wide">
              PANCARTA MANAGER
            </span>
          </div>
          {/* QR code placeholder (fixed in template) */}
          <div
            style={{ width: Math.round(28 * baseFontScale), height: Math.round(28 * baseFontScale) }}
            className="bg-white rounded flex items-center justify-center opacity-90"
            aria-label="QR Code (fixo no template)"
            title="QR Code fixo no template"
          >
            <svg
              aria-hidden="true"
              style={{ width: Math.round(20 * baseFontScale), height: Math.round(20 * baseFontScale) }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3 3h7v7H3V3zm2 2v3h3V5H5zm8-2h7v7h-7V3zm2 2v3h3V5h-3zM3 13h7v7H3v-7zm2 2v3h3v-3H5zm13-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v2h-2v-2zm-4 0h2v4h-4v-2h2v-2zm2 2v2h2v-2h-2z" />
            </svg>
          </div>
        </div>

        {/* ── Descrição zone (white) ── */}
        <div
          style={{ height: descricaoH, backgroundColor: '#FFFFFF' }}
          className="w-full flex flex-col items-center justify-center px-3 border-b border-[#F3F4F6]"
        >
          <p
            style={{
              fontSize: descFontSize,
              lineHeight: 1.3,
              color: '#111827',
              fontWeight: 700,
              textAlign: 'center',
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              maxWidth: '90%',
            }}
          >
            {descricaoProduto || <span style={{ color: '#9CA3AF', fontWeight: 400, fontStyle: 'italic' }}>Descrição do produto</span>}
          </p>
        </div>

        {/* ── Preço Loja zone (white) ── */}
        <div
          style={{ height: precoH, backgroundColor: '#FFFFFF' }}
          className="w-full flex flex-col items-start justify-center px-4 border-b border-[#F3F4F6]"
        >
          <p style={{ fontSize: Math.round(8 * baseFontScale), color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 2 }}>
            Preço Loja
          </p>
          <p style={{ fontSize: precoLojaFontSize, color: '#374151', fontWeight: 600 }}>
            R$ {precoLoja || <span style={{ color: '#D1D5DB' }}>0,00</span>}
          </p>
        </div>

        {/* ── APP/SITE price zone (yellow highlight) ── */}
        <div
          style={{
            height: appH,
            background: 'linear-gradient(135deg, #FFD700 0%, #FFC200 100%)',
          }}
          className="w-full flex flex-col items-center justify-center gap-1 relative overflow-hidden"
        >
          {/* Subtle shine */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, transparent 60%)',
            }}
            aria-hidden="true"
          />
          <p
            style={{
              fontSize: Math.round(9 * baseFontScale),
              color: '#7C6200',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontWeight: 600,
              zIndex: 1,
            }}
          >
            APP e SITE
          </p>
          <p
            style={{
              fontSize: precoAppFontSize,
              color: '#111827',
              fontWeight: 900,
              lineHeight: 1,
              zIndex: 1,
              letterSpacing: '-0.02em',
            }}
          >
            R$ {precoAppSite || <span style={{ color: 'rgba(0,0,0,0.25)' }}>0,00</span>}
          </p>
        </div>

        {/* ── Footer / legal text zone (dark) ── */}
        <div
          style={{
            height: footerH,
            backgroundColor: '#1F2937',
          }}
          className="w-full flex items-center justify-center px-3"
        >
          <p
            style={{
              fontSize: legalFontSize,
              color: 'rgba(255,255,255,0.75)',
              textAlign: 'center',
              lineHeight: 1.4,
              overflow: 'hidden',
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {textoLegal || (
              <span style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic' }}>
                Texto legal gerado automaticamente
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-[#9CA3AF] max-w-xs leading-relaxed">
        A prévia é aproximada. O PDF final é gerado com posicionamento preciso.
      </p>
    </div>
  )
}

export default PosterPreview
