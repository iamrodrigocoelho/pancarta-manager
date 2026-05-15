'use client'

import React from 'react'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  children: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#C41E3A] text-white hover:bg-[#9B1830] active:scale-[0.98] transition-all border border-transparent shadow-sm',
  secondary:
    'bg-white text-[#C41E3A] border border-[#C41E3A] hover:bg-[#FDECEA] active:scale-[0.98] transition-all shadow-sm',
  ghost:
    'bg-transparent text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151] active:scale-[0.98] transition-all border border-transparent',
  danger:
    'bg-[#7F1D1D] text-white hover:bg-[#991B1B] active:scale-[0.98] transition-all border border-transparent shadow-sm',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-md gap-1.5 min-h-[32px]',
  md: 'px-4 py-2 text-sm rounded-lg gap-2 min-h-[40px]',
  lg: 'px-6 py-3 text-base rounded-lg gap-2.5 min-h-[48px]',
}

const spinnerSizeMap: Record<ButtonSize, 'sm' | 'md' | 'lg'> = {
  sm: 'sm',
  md: 'sm',
  lg: 'md',
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-medium font-[\'DM_Sans\',sans-serif]',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C41E3A] focus-visible:outline-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'select-none whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(' ')}
    >
      {loading && (
        <span className="shrink-0">
          <Spinner
            size={spinnerSizeMap[size]}
            color={variant === 'primary' || variant === 'danger' ? 'white' : 'red'}
          />
        </span>
      )}
      {children}
    </button>
  )
}

export default Button
