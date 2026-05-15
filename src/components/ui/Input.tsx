'use client'

import React, { useState } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  required?: boolean
  id?: string
  showPasswordToggle?: boolean
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible ? (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

export function Input({
  label,
  error,
  helpText,
  required,
  id,
  type,
  className = '',
  disabled,
  showPasswordToggle,
  ...props
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)

  const isPassword = type === 'password'
  const resolvedType = isPassword && showPasswordToggle && showPassword ? 'text' : type

  const inputEl = (
    <input
      {...props}
      type={resolvedType}
      id={inputId}
      required={required}
      disabled={disabled}
      aria-invalid={!!error}
      aria-describedby={
        error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined
      }
      className={[
        'w-full rounded-lg border px-3.5 py-2.5',
        'text-sm text-[#0F172A] placeholder:text-[#94A3B8]',
        "font-['Plus_Jakarta_Sans',sans-serif]",
        'md:min-h-[48px] min-h-[44px]',
        'transition-colors duration-150',
        'bg-white',
        isPassword && showPasswordToggle ? 'pr-10' : '',
        error
          ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none'
          : 'border-[#CBD5E1] focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8]',
        disabled ? 'bg-[#F1F5F9] text-[#64748B] cursor-not-allowed opacity-75' : '',
        className,
      ].join(' ')}
    />
  )

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]"
        >
          {label}
          {required && (
            <span className="ml-1 text-[#E41513]" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {isPassword && showPasswordToggle ? (
        <div className="relative">
          {inputEl}
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B] transition-colors"
            tabIndex={-1}
          >
            <EyeIcon visible={showPassword} />
          </button>
        </div>
      ) : (
        inputEl
      )}

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="text-xs text-[#DC2626] flex items-center gap-1"
        >
          <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}

      {helpText && !error && (
        <p id={`${inputId}-help`} className="text-xs text-[#64748B]">
          {helpText}
        </p>
      )}
    </div>
  )
}

export default Input
