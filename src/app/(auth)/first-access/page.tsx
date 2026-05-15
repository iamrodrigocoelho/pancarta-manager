'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// ─── Password validation schema ───────────────────────────────────────────────

const passwordSchema = z
  .object({
    senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
    novaSenha: z
      .string()
      .min(8, 'Mínimo de 8 caracteres')
      .regex(/[A-Z]/, 'Pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Pelo menos um caractere especial'),
    confirmarNovaSenha: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((data) => data.novaSenha === data.confirmarNovaSenha, {
    message: 'As senhas não coincidem',
    path: ['confirmarNovaSenha'],
  })

type FirstAccessFormData = z.infer<typeof passwordSchema>

// ─── Requirement item ─────────────────────────────────────────────────────────

interface RequirementProps {
  met: boolean
  label: string
}

function Requirement({ met, label }: RequirementProps) {
  return (
    <li className="flex items-center gap-2 text-sm transition-colors duration-200">
      <span
        className={[
          'flex items-center justify-center w-4.5 h-4.5 rounded-full shrink-0 transition-all duration-300',
          met
            ? 'bg-[#059669] text-white scale-110'
            : 'bg-[#E2E8F0] text-[#94A3B8]',
        ].join(' ')}
        aria-hidden="true"
      >
        {met ? (
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
          </svg>
        ) : (
          <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 8 8">
            <circle cx="4" cy="4" r="3" />
          </svg>
        )}
      </span>
      <span className={met ? 'text-[#059669] font-medium' : 'text-[#64748B]'}>{label}</span>
    </li>
  )
}

// ─── Password strength bar ────────────────────────────────────────────────────

function StrengthBar({ password }: { password: string }) {
  const checks = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ]

  const score = checks.filter(Boolean).length

  const levels: { label: string; color: string; width: string }[] = [
    { label: '', color: 'bg-[#E2E8F0]', width: 'w-0' },
    { label: 'Muito fraca', color: 'bg-[#DC2626]', width: 'w-1/5' },
    { label: 'Fraca', color: 'bg-[#F97316]', width: 'w-2/5' },
    { label: 'Média', color: 'bg-[#D97706]', width: 'w-3/5' },
    { label: 'Forte', color: 'bg-[#059669]', width: 'w-4/5' },
    { label: 'Muito forte', color: 'bg-[#059669]', width: 'w-full' },
  ]

  const current = levels[score]

  if (!password) return null

  return (
    <div className="flex flex-col gap-1.5">
      <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
        <div
          className={['h-full rounded-full transition-all duration-500', current.color, current.width].join(' ')}
        />
      </div>
      {current.label && (
        <p className={['text-xs font-medium', score >= 4 ? 'text-[#059669]' : score >= 3 ? 'text-[#D97706]' : 'text-[#DC2626]'].join(' ')}>
          Força da senha: {current.label}
        </p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FirstAccessPage() {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FirstAccessFormData>({
    resolver: zodResolver(passwordSchema),
    mode: 'onChange',
  })

  const novaSenhaValue = watch('novaSenha') ?? ''

  const requirements = [
    { met: novaSenhaValue.length >= 8, label: 'Mínimo de 8 caracteres' },
    { met: /[A-Z]/.test(novaSenhaValue), label: 'Pelo menos uma letra maiúscula (A–Z)' },
    { met: /[a-z]/.test(novaSenhaValue), label: 'Pelo menos uma letra minúscula (a–z)' },
    { met: /[0-9]/.test(novaSenhaValue), label: 'Pelo menos um número (0–9)' },
    { met: /[^A-Za-z0-9]/.test(novaSenhaValue), label: 'Pelo menos um caractere especial (!@#$…)' },
  ]

  const onSubmit = async (data: FirstAccessFormData) => {
    setServerError(null)

    try {
      const res = await fetch('/api/auth/first-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword: data.senhaAtual,
          newPassword: data.novaSenha,
          confirmPassword: data.confirmarNovaSenha,
        }),
      })

      const body: { error?: string } = await res.json()

      if (!res.ok) {
        setServerError(body.error ?? 'Erro ao trocar a senha. Tente novamente.')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    } catch {
      setServerError('Erro de conexão. Verifique sua internet e tente novamente.')
    }
  }

  if (success) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-[#F8FAFC] px-4">
        <div className="text-center animate-fade-in-up flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#D1FAE5] flex items-center justify-center">
            <svg className="w-8 h-8 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A]" style={{ fontFamily: "'Sora', sans-serif" }}>
              Senha definida com sucesso!
            </h2>
            <p className="mt-1 text-sm text-[#64748B]">Redirecionando para o dashboard…</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#E41513] flex items-center justify-center shrink-0">
            <svg aria-hidden="true" className="w-5.5 h-5.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
            </svg>
          </div>
          <div>
            <h1
              className="text-xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Primeiro acesso
            </h1>
            <p className="text-sm text-[#64748B]">Defina sua senha para continuar</p>
          </div>
        </div>

        {/* Info banner */}
        <div className="mb-6 px-4 py-3 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-2.5">
          <svg aria-hidden="true" className="w-4.5 h-4.5 text-[#D97706] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-sm text-[#92400E]">
            Por segurança, você deve definir uma nova senha neste primeiro acesso.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col gap-6">
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

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <Input
              label="Senha atual"
              type="password"
              id="senhaAtual"
              autoComplete="current-password"
              placeholder="••••••••"
              required
              error={errors.senhaAtual?.message}
              {...register('senhaAtual')}
            />

            <div className="flex flex-col gap-2">
              <Input
                label="Nova senha"
                type="password"
                id="novaSenha"
                autoComplete="new-password"
                placeholder="••••••••"
                required
                error={errors.novaSenha?.message}
                {...register('novaSenha')}
              />
              <StrengthBar password={novaSenhaValue} />
            </div>

            <Input
              label="Confirmar nova senha"
              type="password"
              id="confirmarNovaSenha"
              autoComplete="new-password"
              placeholder="••••••••"
              required
              error={errors.confirmarNovaSenha?.message}
              {...register('confirmarNovaSenha')}
            />

            {/* Requirements checklist */}
            <div className="rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] p-4">
              <p className="text-xs font-semibold text-[#334155] uppercase tracking-wider mb-3">
                Requisitos da senha
              </p>
              <ul className="flex flex-col gap-2" aria-label="Requisitos de senha">
                {requirements.map((req) => (
                  <Requirement key={req.label} met={req.met} label={req.label} />
                ))}
              </ul>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Salvando…' : 'Definir nova senha'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
