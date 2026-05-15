'use client'

import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'
import { Spinner } from '@/components/ui/Spinner'
import type { SessionUser } from '@/types'

// ─── Schema ───────────────────────────────────────────────────────────────────

const posterFormSchema = z.object({
  formato: z.enum(['A4', 'A6'] as const, { error: 'Selecione o formato' }),
  descricaoProduto: z.string().min(1, 'Descrição obrigatória').max(200, 'Máximo de 200 caracteres'),
  precoLoja: z
    .string()
    .min(1, 'Preço loja obrigatório')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Preço inválido (ex: 9,99)'),
  precoAppSite: z
    .string()
    .min(1, 'Preço APP/SITE obrigatório')
    .regex(/^\d+([.,]\d{1,2})?$/, 'Preço inválido (ex: 9,99)'),
  ean: z.string().min(1, 'EAN obrigatório').regex(/^\d+$/, 'EAN deve conter apenas números'),
  codigoProduto: z.string().min(1, 'Código do produto obrigatório'),
  dataValidade: z
    .string()
    .min(1, 'Data de validade obrigatória')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato DD/MM/AAAA')
    .refine((val) => {
      const [d, m, y] = val.split('/').map(Number)
      const dt = new Date(y, m - 1, d)
      return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d
    }, 'Data inválida'),
  canalOferta: z.string().min(1, 'Canal da oferta obrigatório'),
  campanha: z.string().optional(),
  observacoes: z.string().optional(),
})

type PosterFormData = z.infer<typeof posterFormSchema>

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CreatedPoster {
  id: string
  descricao_produto: string
  preco_loja: string
  preco_app_site: string
  texto_legal: string
  status: string
  template?: { formato: 'A4' | 'A6' }
  formato?: 'A4' | 'A6'
}

interface PosterFormProps {
  session: SessionUser
  onSuccess: (poster: CreatedPoster) => void
}

// ─── Template selector ────────────────────────────────────────────────────────

interface Template {
  id: string
  nome: string
  formato: 'A4' | 'A6'
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function generateLegalTextPreview(
  dataValidade: string,
  canalOferta: string,
  ean: string,
  codigoProduto: string
): string {
  if (!dataValidade || !canalOferta || !ean || !codigoProduto) return ''
  return `Promoção válida até ${dataValidade}. Oferta exclusiva ${canalOferta}, enquanto durarem os estoques. EAN: ${ean} | CÓD: ${codigoProduto}`
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FormatoCard({
  value,
  selected,
  onClick,
}: {
  value: 'A4' | 'A6'
  selected: boolean
  onClick: () => void
}) {
  const isA4 = value === 'A4'
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={[
        'relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 cursor-pointer transition-all duration-150 select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
        selected
          ? 'border-[#E41513] bg-[#FEE8E8] shadow-md'
          : 'border-[#E2E8F0] bg-white hover:border-[#E41513]/40 hover:bg-[#FEE8E8]/30',
      ].join(' ')}
    >
      {/* Paper icon */}
      <div
        className={[
          'flex items-end justify-center rounded border-2 transition-colors',
          isA4 ? 'w-10 h-14' : 'w-12 h-9',
          selected ? 'border-[#E41513] bg-[#E41513]/10' : 'border-[#CBD5E1] bg-[#F8FAFC]',
        ].join(' ')}
        aria-hidden="true"
      >
        {selected && (
          <span className="mb-1 text-[#E41513]">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" clipRule="evenodd" />
            </svg>
          </span>
        )}
      </div>
      <div className="text-center">
        <p className={['font-bold text-base font-[\'Sora\',sans-serif]', selected ? 'text-[#E41513]' : 'text-[#334155]'].join(' ')}>
          {value}
        </p>
        <p className="text-xs text-[#64748B] mt-0.5">
          {isA4 ? '210 × 297 mm' : '105 × 148 mm'}
        </p>
      </div>
      {selected && (
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#E41513]" aria-hidden="true" />
      )}
    </button>
  )
}

function PriceInput({
  id,
  label,
  error,
  highlighted,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  id: string
  label: string
  error?: string
  highlighted?: boolean
}) {
  return (
    <div className={['flex flex-col gap-1.5 w-full rounded-xl p-3 -m-3', highlighted ? 'bg-[#FFF8DC] border border-[#FFD700]/50' : ''].join(' ')}>
      <label htmlFor={id} className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]">
        {label}
        <span className="ml-1 text-[#E41513]" aria-hidden="true">*</span>
        {highlighted && (
          <span className="ml-2 text-xs font-semibold text-[#B8860B] bg-[#FFD700]/30 px-1.5 py-0.5 rounded-full">
            APP/SITE
          </span>
        )}
      </label>
      <div className="flex items-center gap-0">
        <span
          className={[
            'flex items-center px-3 rounded-l-lg border border-r-0 h-[44px] md:h-[48px] text-sm font-medium shrink-0',
            highlighted
              ? 'bg-[#FFD700]/40 border-[#FFD700] text-[#7C6200]'
              : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B]',
            error ? 'border-[#DC2626]' : '',
          ].join(' ')}
          aria-hidden="true"
        >
          R$
        </span>
        <input
          id={id}
          aria-label={label}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={[
            'flex-1 rounded-r-lg border px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8]',
            'font-[\'Plus_Jakarta_Sans\',sans-serif] md:min-h-[48px] min-h-[44px] transition-colors duration-150',
            highlighted ? 'font-bold text-base bg-[#FFFBEA]' : 'bg-white',
            error
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none'
              : highlighted
                ? 'border-[#FFD700] focus:border-[#B8860B] focus:ring-2 focus:ring-[#FFD700]/40 focus:outline-none hover:border-[#B8860B]'
                : 'border-[#CBD5E1] focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8]',
          ].join(' ')}
          {...props}
        />
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-[#DC2626] flex items-center gap-1">
          <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PosterForm({ session, onSuccess }: PosterFormProps) {
  const { success, error: showError } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(true)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PosterFormData>({
    resolver: zodResolver(posterFormSchema),
    defaultValues: {
      formato: 'A4',
      canalOferta: '',
    },
  })

  const watchedValues = watch(['dataValidade', 'canalOferta', 'ean', 'codigoProduto'])
  const [dataValidade, canalOferta, ean, codigoProduto] = watchedValues
  const textoLegalPreview = generateLegalTextPreview(
    dataValidade ?? '',
    canalOferta ?? '',
    ean ?? '',
    codigoProduto ?? ''
  )

  // Fetch templates
  useEffect(() => {
    fetch('/api/templates', { credentials: 'include' })
      .then((r) => r.json())
      .then((body) => {
        const list: Template[] = body.data ?? []
        setTemplates(list)
      })
      .catch(() => {
        // silently fail — user will get error on submit
      })
      .finally(() => setLoadingTemplates(false))
  }, [])

  const formatoSelected = watch('formato')

  const onSubmit = async (data: PosterFormData) => {
    setServerError(null)

    // Find matching template
    const template = templates.find((t) => t.formato === data.formato)
    if (!template) {
      setServerError(`Nenhum template ${data.formato} disponível no sistema.`)
      return
    }

    const payload = {
      templateId: template.id,
      formato: data.formato,
      descricaoProduto: data.descricaoProduto,
      precoLoja: data.precoLoja.replace(',', '.'),
      precoAppSite: data.precoAppSite.replace(',', '.'),
      ean: data.ean,
      codigoProduto: data.codigoProduto,
      dataValidade: data.dataValidade,
      canalOferta: data.canalOferta,
      campanha: data.campanha ?? undefined,
      observacoes: data.observacoes ?? undefined,
      ...(session.perfil !== 'LOJA' && session.lojaId ? { lojaId: session.lojaId } : {}),
    }

    try {
      const res = await fetch('/api/posters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      })

      const body = await res.json()

      if (!res.ok) {
        setServerError(body.error ?? 'Erro ao criar pancarta. Tente novamente.')
        return
      }

      success('Pancarta criada com sucesso!')
      onSuccess({ ...body.data, formato: data.formato })
    } catch {
      const msg = 'Erro de conexão. Verifique sua internet e tente novamente.'
      setServerError(msg)
      showError(msg)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-6">
      {/* Server error */}
      {serverError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-[#FEE8E8] border border-[#FCA5A5] text-sm text-[#E41513]"
        >
          <svg aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{serverError}</span>
        </div>
      )}

      {/* Formato */}
      <div className="flex flex-col gap-2">
        <fieldset>
          <legend className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif] mb-3">
            Formato da Pancarta <span className="text-[#E41513]" aria-hidden="true">*</span>
          </legend>
          {loadingTemplates ? (
            <div className="flex items-center gap-2 text-sm text-[#64748B]">
              <Spinner size="sm" /> Carregando formatos…
            </div>
          ) : (
            <Controller
              control={control}
              name="formato"
              render={({ field }) => (
                <div className="flex gap-4">
                  {(['A4', 'A6'] as const).map((fmt) => (
                    <FormatoCard
                      key={fmt}
                      value={fmt}
                      selected={field.value === fmt}
                      onClick={() => field.onChange(fmt)}
                    />
                  ))}
                </div>
              )}
            />
          )}
          {errors.formato && (
            <p role="alert" className="mt-1.5 text-xs text-[#DC2626] flex items-center gap-1">
              <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.formato.message}
            </p>
          )}
        </fieldset>
      </div>

      {/* Descrição */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="descricaoProduto" className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]">
          Descrição do Produto <span className="text-[#E41513]" aria-hidden="true">*</span>
        </label>
        <textarea
          id="descricaoProduto"
          rows={3}
          placeholder="Ex: Refrigerante Cola 2L"
          aria-invalid={!!errors.descricaoProduto}
          aria-describedby={errors.descricaoProduto ? 'descricaoProduto-error' : undefined}
          className={[
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8]',
            "font-['Plus_Jakarta_Sans',sans-serif] resize-none transition-colors duration-150 bg-white",
            errors.descricaoProduto
              ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none'
              : 'border-[#CBD5E1] focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8]',
          ].join(' ')}
          {...register('descricaoProduto')}
        />
        {errors.descricaoProduto && (
          <p id="descricaoProduto-error" role="alert" className="text-xs text-[#DC2626] flex items-center gap-1">
            <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {errors.descricaoProduto.message}
          </p>
        )}
      </div>

      {/* Preços */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PriceInput
          id="precoLoja"
          label="Preço Loja"
          placeholder="19,90"
          inputMode="decimal"
          error={errors.precoLoja?.message}
          {...register('precoLoja')}
        />
        <PriceInput
          id="precoAppSite"
          label="Preço APP/SITE"
          placeholder="14,90"
          inputMode="decimal"
          highlighted
          error={errors.precoAppSite?.message}
          {...register('precoAppSite')}
        />
      </div>

      {/* EAN & Código */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="EAN"
          id="ean"
          type="text"
          inputMode="numeric"
          placeholder="7891000000000"
          required
          error={errors.ean?.message}
          {...register('ean')}
        />
        <Input
          label="Código do Produto"
          id="codigoProduto"
          type="text"
          placeholder="COD-001"
          required
          error={errors.codigoProduto?.message}
          {...register('codigoProduto')}
        />
      </div>

      {/* Data validade & Canal oferta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Input
          label="Data de Validade"
          id="dataValidade"
          type="text"
          inputMode="numeric"
          placeholder="DD/MM/AAAA"
          required
          error={errors.dataValidade?.message}
          {...register('dataValidade', {
            onChange: (e) => {
              // Auto-format as user types
              let v = e.target.value.replace(/\D/g, '')
              if (v.length > 2) v = v.slice(0, 2) + '/' + v.slice(2)
              if (v.length > 5) v = v.slice(0, 5) + '/' + v.slice(5)
              if (v.length > 10) v = v.slice(0, 10)
              setValue('dataValidade', v, { shouldValidate: false })
            },
          })}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="canalOferta" className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]">
            Canal da Oferta <span className="text-[#E41513]" aria-hidden="true">*</span>
          </label>
          <select
            id="canalOferta"
            aria-invalid={!!errors.canalOferta}
            aria-describedby={errors.canalOferta ? 'canalOferta-error' : undefined}
            className={[
              'w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0F172A]',
              "font-['Plus_Jakarta_Sans',sans-serif] md:min-h-[48px] min-h-[44px] transition-colors duration-150 bg-white appearance-none cursor-pointer",
              errors.canalOferta
                ? 'border-[#DC2626] focus:border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none'
                : 'border-[#CBD5E1] focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8]',
            ].join(' ')}
            {...register('canalOferta')}
          >
            <option value="" disabled>Selecione o canal…</option>
            <option value="APP e SITE">APP e SITE</option>
            <option value="APP">APP</option>
            <option value="SITE">SITE</option>
            <option value="Loja Física">Loja Física</option>
          </select>
          {errors.canalOferta && (
            <p id="canalOferta-error" role="alert" className="text-xs text-[#DC2626] flex items-center gap-1">
              <svg aria-hidden="true" className="w-3.5 h-3.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {errors.canalOferta.message}
            </p>
          )}
        </div>
      </div>

      {/* Campanha (optional) */}
      <Input
        label="Campanha (opcional)"
        id="campanha"
        type="text"
        placeholder="Ex: Semana do Consumidor"
        error={errors.campanha?.message}
        {...register('campanha')}
      />

      {/* Observações (optional) */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="observacoes" className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]">
          Observações internas (opcional)
        </label>
        <textarea
          id="observacoes"
          rows={2}
          placeholder="Notas internas sobre esta pancarta…"
          className={[
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-[#94A3B8]',
            "font-['Plus_Jakarta_Sans',sans-serif] resize-none transition-colors duration-150 bg-white",
            'border-[#CBD5E1] focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8]',
          ].join(' ')}
          {...register('observacoes')}
        />
      </div>

      {/* Texto legal preview */}
      <div
        className="flex flex-col gap-2 p-4 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0]"
        aria-live="polite"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
          <svg aria-hidden="true" className="w-4 h-4 text-[#94A3B8]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          Texto legal (gerado automaticamente — não editável)
        </div>
        <p className="text-xs text-[#334155] leading-relaxed font-mono">
          {textoLegalPreview || (
            <span className="text-[#94A3B8] italic">
              Preencha data de validade, canal da oferta, EAN e código do produto para visualizar o texto legal.
            </span>
          )}
        </p>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="min-w-[180px]"
        >
          {isSubmitting ? 'Criando pancarta…' : 'Criar Pancarta'}
        </Button>
      </div>
    </form>
  )
}

export default PosterForm
