'use client'

import React, { useRef, useState, useCallback } from 'react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'

// ─── Types ────────────────────────────────────────────────────────────────────

interface CsvUploaderProps {
  /** API endpoint to POST the file to (multipart/form-data, field name "file"). */
  endpoint: string
  /** Called with the server response body.data on successful upload. */
  onResult: (data: unknown) => void
  /** Called on network / server error with a human-readable message. */
  onError?: (message: string) => void
  /** Label shown inside the drop-zone. */
  label?: string
  /** Whether the uploader is busy from the outside. */
  disabled?: boolean
  /** Optional URL to a template CSV the user can download as a guide. */
  templateDownloadUrl?: string
  /** Max accepted file size in MB (default: 5). */
  maxSizeMB?: number
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CsvUploader({
  endpoint,
  onResult,
  onError,
  label = 'Arraste o arquivo CSV ou clique para selecionar',
  disabled = false,
  templateDownloadUrl,
  maxSizeMB = 5,
}: CsvUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [localError, setLocalError] = useState<string | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const uploadFile = useCallback(
    async (file: File) => {
      // Validate type
      if (!file.name.toLowerCase().endsWith('.csv')) {
        const msg = 'Somente arquivos .csv são aceitos.'
        setLocalError(msg)
        onError?.(msg)
        return
      }
      // Validate size
      if (file.size > maxSizeMB * 1024 * 1024) {
        const msg = `O arquivo excede o limite de ${maxSizeMB}MB.`
        setLocalError(msg)
        onError?.(msg)
        return
      }

      setLocalError(null)
      setFileName(file.name)
      setUploading(true)
      setProgress(0)

      // Animate progress bar during upload
      const tick = setInterval(() => {
        setProgress((p) => {
          if (p >= 80) { clearInterval(tick); return 80 }
          return p + 12
        })
      }, 180)

      try {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch(endpoint, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        })

        clearInterval(tick)
        setProgress(100)

        const body: { data?: unknown; error?: string } = await res.json()

        if (!res.ok) {
          const msg = body.error ?? `Erro ${res.status} ao processar arquivo.`
          setLocalError(msg)
          onError?.(msg)
          setProgress(0)
          return
        }

        onResult(body.data)
      } catch {
        clearInterval(tick)
        const msg = 'Erro de conexão ao enviar o arquivo. Tente novamente.'
        setLocalError(msg)
        onError?.(msg)
        setProgress(0)
      } finally {
        setUploading(false)
      }
    },
    [endpoint, onResult, onError, maxSizeMB]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void uploadFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void uploadFile(file)
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (!uploading && !disabled) setDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && !uploading && !disabled) {
      e.preventDefault()
      inputRef.current?.click()
    }
  }

  const clearError = () => {
    setLocalError(null)
    setFileName(null)
    setProgress(0)
  }

  const isInteractive = !uploading && !disabled

  return (
    <div className="flex flex-col gap-4">
      {/* Drop zone */}
      <div
        role="button"
        tabIndex={isInteractive ? 0 : -1}
        aria-label="Área de upload de arquivo CSV. Arraste um arquivo ou pressione Enter para selecionar."
        aria-disabled={!isInteractive}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onKeyDown={handleKeyDown}
        onClick={() => isInteractive && inputRef.current?.click()}
        className={[
          'flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed',
          'px-6 py-12 text-center transition-all duration-150 cursor-pointer select-none',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C41E3A] focus-visible:outline-offset-2',
          dragging
            ? 'border-[#C41E3A] bg-[#FDECEA]/60 scale-[1.01] shadow-lg'
            : localError
              ? 'border-[#DC2626] bg-[#FDECEA]/20 hover:border-[#C41E3A] hover:bg-[#FDECEA]/30'
              : uploading
                ? 'border-[#C41E3A]/30 bg-[#FDECEA]/20 cursor-wait'
                : 'border-[#D1D5DB] bg-[#F9FAFB] hover:border-[#C41E3A]/60 hover:bg-[#FDECEA]/20',
          !isInteractive ? 'opacity-60 pointer-events-none' : '',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="sr-only"
          onChange={handleFileChange}
          tabIndex={-1}
          aria-hidden="true"
        />

        {uploading ? (
          <>
            <Spinner size="lg" color="red" />
            <div className="flex flex-col items-center gap-2.5 w-full max-w-xs">
              <p className="text-sm font-medium text-[#374151] font-['DM_Sans',sans-serif]">
                Processando <strong>{fileName}</strong>…
              </p>
              {/* Progress bar */}
              <div className="w-full h-1.5 rounded-full bg-[#E5E7EB] overflow-hidden" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-[#C41E3A] transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-[#9CA3AF]">{progress}%</p>
            </div>
          </>
        ) : (
          <>
            {/* Icon */}
            <div
              className={[
                'flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-colors',
                dragging
                  ? 'border-[#C41E3A] bg-[#FDECEA] text-[#C41E3A]'
                  : 'border-[#E5E7EB] bg-white text-[#9CA3AF]',
              ].join(' ')}
              aria-hidden="true"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-medium text-[#374151] font-['DM_Sans',sans-serif]">
                {dragging ? 'Solte o arquivo aqui' : label}
              </p>
              <p className="text-xs text-[#9CA3AF] mt-1">
                Somente <strong className="text-[#6B7280]">.csv</strong>
                {' '}·{' '}
                Máximo <strong className="text-[#6B7280]">{maxSizeMB}MB</strong>
                {' '}·{' '}
                Máximo <strong className="text-[#6B7280]">200 linhas</strong>
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
            >
              <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Selecionar arquivo
            </Button>
          </>
        )}
      </div>

      {/* Error message */}
      {localError && !uploading && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-[#FDECEA] border border-[#FCA5A5] text-sm text-[#C41E3A]"
        >
          <svg aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="flex-1">
            <p className="font-medium">{localError}</p>
            <button
              type="button"
              onClick={clearError}
              className="mt-1 text-xs underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}

      {/* Template download */}
      {templateDownloadUrl && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#F0FDF4] border border-emerald-200">
          <div className="flex items-center gap-2">
            <svg aria-hidden="true" className="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-emerald-700">Modelo de CSV</p>
              <p className="text-xs text-emerald-600">Baixe o modelo e preencha com os dados das pancartas</p>
            </div>
          </div>
          <a
            href={templateDownloadUrl}
            download
            className={[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0',
              'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-500 focus-visible:outline-offset-2',
            ].join(' ')}
          >
            <svg aria-hidden="true" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Baixar modelo
          </a>
        </div>
      )}
    </div>
  )
}

export default CsvUploader
