'use client'

import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  id?: string
}

export function Input({
  label,
  error,
  helpText,
  required,
  id,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#374151] font-['DM_Sans',sans-serif]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[#C41E3A]" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <input
        {...props}
        id={inputId}
        required={required}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={
          error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
        }
        className={[
          'w-full rounded-lg border px-3.5 py-2.5',
          'text-sm text-[#111827] placeholder:text-[#9CA3AF]',
          'font-[\'DM_Sans\',sans-serif]',
          'md:min-h-[48px] min-h-[44px]',
          'transition-colors duration-150',
          'bg-white',
          error
            ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none'
            : 'border-[#D1D5DB] focus:border-[#C41E3A] focus:ring-2 focus:ring-[#C41E3A]/20 focus:outline-none hover:border-[#9CA3AF]',
          disabled ? 'bg-[#F3F4F6] text-[#6B7280] cursor-not-allowed opacity-75' : '',
          className,
        ].join(' ')}
      />

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-[#DC2626] flex items-center gap-1"
        >
          <svg
            aria-hidden="true"
            className="w-3.5 h-3.5 shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={`${inputId}-help`} className="text-xs text-[#6B7280]">
          {helpText}
        </p>
      )}
    </div>
  )
}

export default Input
