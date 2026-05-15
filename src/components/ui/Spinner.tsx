'use client'

import React from 'react'

type SpinnerSize = 'sm' | 'md' | 'lg'
type SpinnerColor = 'red' | 'white' | 'gray'

interface SpinnerProps {
  size?: SpinnerSize
  color?: SpinnerColor
  className?: string
  'aria-label'?: string
}

const sizeClasses: Record<SpinnerSize, string> = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-[3px]',
}

const colorClasses: Record<SpinnerColor, string> = {
  red: 'border-[#E41513]/20 border-t-[#E41513]',
  white: 'border-white/30 border-t-white',
  gray: 'border-[#CBD5E1] border-t-[#64748B]',
}

export function Spinner({
  size = 'md',
  color = 'red',
  className = '',
  'aria-label': ariaLabel = 'Carregando…',
}: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={[
        'inline-block rounded-full animate-spin shrink-0',
        sizeClasses[size],
        colorClasses[color],
        className,
      ].join(' ')}
    />
  )
}

export default Spinner
