'use client'

import React from 'react'
// PosterStatus is re-exported from @/types which mirrors @prisma/client.
// We import from @/types to avoid requiring `prisma generate` at compile time.
import type { PosterStatus } from '@/types'

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral'

interface BadgeProps {
  status?: PosterStatus | string
  variant?: BadgeVariant
  className?: string
  children?: React.ReactNode
}

const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
  RASCUNHO: { variant: 'neutral', label: 'Rascunho' },
  AGUARDANDO_CONFERENCIA: { variant: 'warning', label: 'Aguardando Conferência' },
  APROVADA_PELA_LOJA: { variant: 'success', label: 'Aprovada pela Loja' },
  PDF_GERADO: { variant: 'info', label: 'PDF Gerado' },
  DOWNLOAD_REALIZADO: { variant: 'info', label: 'Download Realizado' },
  EXPIRADA: { variant: 'neutral', label: 'Expirada' },
  CANCELADA: { variant: 'error', label: 'Cancelada' },
  ERRO_VALIDACAO: { variant: 'error', label: 'Erro de Validação' },
}

const variantClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  warning: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  error: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  neutral: 'bg-[#F3F4F6] text-[#6B7280] ring-1 ring-[#E5E7EB]',
}

const dotClasses: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-red-500',
  info: 'bg-blue-500',
  neutral: 'bg-[#9CA3AF]',
}

// Indigo override for DOWNLOAD_REALIZADO
const downloadConfig: BadgeVariant = 'info'
const downloadClasses =
  'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
const downloadDot = 'bg-indigo-500'

export function Badge({ status, variant, className = '', children }: BadgeProps) {
  let resolvedVariant: BadgeVariant = variant ?? 'neutral'
  let label: string = ''
  let isDownload = false

  if (status) {
    const cfg = statusConfig[status]
    if (cfg) {
      resolvedVariant = variant ?? cfg.variant
      label = cfg.label
      isDownload = status === 'DOWNLOAD_REALIZADO'
    } else {
      label = status
    }
  }

  const displayText = children ?? label

  const containerClass = isDownload && !variant
    ? downloadClasses
    : variantClasses[resolvedVariant]

  const dotClass = isDownload && !variant
    ? downloadDot
    : dotClasses[resolvedVariant]

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium',
        'font-[\'DM_Sans\',sans-serif]',
        containerClass,
        className,
      ].join(' ')}
    >
      <span className={['w-1.5 h-1.5 rounded-full shrink-0', dotClass].join(' ')} aria-hidden="true" />
      {displayText}
    </span>
  )
}

export default Badge
