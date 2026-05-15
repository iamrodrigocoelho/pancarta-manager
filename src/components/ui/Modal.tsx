'use client'

import React, { useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeOnBackdrop?: boolean
  className?: string
}

const sizeClasses: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
}

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnBackdrop = true,
  className = '',
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const previousActiveElement = useRef<Element | null>(null)

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }

      // Trap focus inside modal
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last?.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first?.focus()
          }
        }
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (open) {
      previousActiveElement.current = document.activeElement
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'

      // Focus the dialog on open
      requestAnimationFrame(() => {
        dialogRef.current?.focus()
      })
    } else {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      ;(previousActiveElement.current as HTMLElement | null)?.focus()
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  if (!open) return null

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      aria-modal="true"
      role="dialog"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true"
      />

      {/* Dialog panel */}
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={[
          'relative w-full bg-white rounded-xl shadow-2xl',
          'flex flex-col max-h-[90dvh]',
          'animate-fade-in',
          sizeClasses[size],
          className,
        ].join(' ')}
        style={{ animation: 'fadeInUp 0.25s ease both' }}
      >
        {/* Header */}
        {(title != null) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] shrink-0">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-[#0F172A] font-['Sora',sans-serif]"
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Fechar modal"
              className="flex items-center justify-center w-8 h-8 rounded-lg text-[#64748B] hover:text-[#334155] hover:bg-[#F1F5F9] transition-colors"
            >
              <svg
                aria-hidden="true"
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 min-h-0">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#E2E8F0] bg-[#F8FAFC] rounded-b-xl shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

export default Modal
