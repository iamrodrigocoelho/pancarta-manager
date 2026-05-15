'use client'

import React, { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'

// ─── Schema ───────────────────────────────────────────────────────────────────

const resetSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Mínimo de 8 caracteres')
      .regex(/[A-Z]/, 'Pelo menos uma letra maiúscula')
      .regex(/[a-z]/, 'Pelo menos uma letra minúscula')
      .regex(/[0-9]/, 'Pelo menos um número')
      .regex(/[^A-Za-z0-9]/, 'Pelo menos um caractere especial'),
    confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetFormData = z.infer<typeof resetSchema>

// ─── Requirement chip ─────────────────────────────────────────────────────────

function Requirement({ met, label }: { met: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <span
        className={[
          'w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-300',
          met ? 'bg-[#059669] text-white' : 'bg-[#E5E7EB] text-[#9CA3AF]',
        ].join(' ')}
        aria-hidden="true"
      >
        {met ? (
          <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
          </svg>
        ) : (
          <svg className="w-1.5 h-1.5" fill="currentColor" viewBox="0 0 6 6">
            <circle cx="3" cy="3" r="2.5" />
          </svg>
        )}
      </span>
      <span className={met ? 'text-[#059669] font-medium' : 'text-[#6B7280]'}>{label}</span>
    </li>
  )
}

// ─── Inner form (reads searchParams) ─────────────────────────────────────────

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [tokenMissing, setTokenMissing] = useState(false)

  useEffect(() => {
    if (!token) setTokenMissing(true)
  }, [token])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    mode: 'onChange',
  })

  const newPasswordValue = watch('newPassword') ?? ''

  const requirements = [
    { met: newPasswordValue.length >= 8, label: 'Mínimo de 8 caracteres' },
    { met: /[A-Z]/.test(newPasswordValue), label: 'Uma letra maiúscula (A–Z)' },
    { met: /[a-z]/.test(newPasswordValue), label: 'Uma letra minúscula (a–z)' },
    { met: /[0-9]/.test(newPasswordValue), label: 'Um número (0–9)' },
    { met: /[^A-Za-z0-9]/.test(newPasswordValue), label: 'Um caractere especial (!@#$…)' },
  ]

  const onSubmit = async (data: ResetFormData) => {
    if (!token) return
    setServerError(null)

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      })

      const body: { error?: string } = await res.json()

      if (!res.ok) {
        setServerError(body.error ?? 'Erro ao redefinir a senha. O link pode ter expirado.')
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login?passwordReset=1')
      }, 2000)
    } catch {
      setServerError('Erro de conexão. Verifique sua internet e tente novamente.')
    }
  }

  // ── Token missing ──────────────────────────────────────────────────────────

  if (tokenMissing) {
    return (
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 flex flex-col items-center text-center gap-4 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-[#FDECEA] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#C41E3A]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        </div>
        <div>
          <h1
            className="text-lg font-bold text-[#111827]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Link inválido
          </h1>
          <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
            O link de redefinição de senha está incompleto ou expirou.
            Solicite um novo link de recuperação.
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="w-full flex items-center justify-center h-11 rounded-lg bg-[#C41E3A] text-white text-sm font-semibold hover:bg-[#9B1830] transition-colors"
        >
          Solicitar novo link
        </Link>
      </div>
    )
  }

  // ── Success ────────────────────────────────────────────────────────────────

  if (success) {
    return (
      <div className="w-full max-w-sm bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-8 flex flex-col items-center text-center gap-4 animate-fade-in">
        <div className="w-14 h-14 rounded-full bg-[#D1FAE5] flex items-center justify-center">
          <svg className="w-7 h-7 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2
            className="text-lg font-bold text-[#111827]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Senha redefinida!
          </h2>
          <p className="mt-2 text-sm text-[#6B7280]">Redirecionando para o login…</p>
        </div>
      </div>
    )
  }

  // ── Form ──────────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-md">
      {/* Back link */}
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 text-sm text-[#6B7280] hover:text-[#374151] transition-colors mb-8"
      >
        <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Voltar para o login
      </Link>

      {/* Heading */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-[#C41E3A] flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <div>
          <h1
            className="text-xl font-bold text-[#111827]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Nova senha
          </h1>
          <p className="text-sm text-[#6B7280]">Escolha uma senha segura para sua conta</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm p-6 flex flex-col gap-5">
        {/* Server error */}
        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2.5 px-4 py-3 rounded-lg bg-[#FDECEA] border border-[#FCA5A5] text-sm text-[#C41E3A]"
          >
            <svg aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
          <Input
            label="Nova senha"
            type="password"
            id="newPassword"
            autoComplete="new-password"
            autoFocus
            placeholder="••••••••"
            required
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />

          <Input
            label="Confirmar nova senha"
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            placeholder="••••••••"
            required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword')}
          />

          {/* Requirements */}
          {newPasswordValue.length > 0 && (
            <div className="rounded-xl bg-[#F9FAFB] border border-[#E5E7EB] px-4 py-3">
              <ul className="flex flex-col gap-1.5" aria-label="Requisitos de senha">
                {requirements.map((req) => (
                  <Requirement key={req.label} met={req.met} label={req.label} />
                ))}
              </ul>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Salvando…' : 'Redefinir senha'}
          </Button>
        </form>
      </div>
    </div>
  )
}

// ─── Page (with Suspense boundary for useSearchParams) ────────────────────────

export default function ResetPasswordPage() {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F9FAFB] px-4 py-12">
      <Suspense
        fallback={
          <div className="flex items-center justify-center">
            <Spinner size="lg" color="red" aria-label="Carregando página de redefinição…" />
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
