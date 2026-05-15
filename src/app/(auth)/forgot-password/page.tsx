'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

// ─── Schema ───────────────────────────────────────────────────────────────────

const forgotSchema = z.object({
  identifier: z.string().min(1, 'Informe sua matrícula ou e-mail'),
})

type ForgotFormData = z.infer<typeof forgotSchema>

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotFormData) => {
    // Always show success — never reveal whether the account exists.
    await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: data.identifier }),
    }).catch(() => {
      // Silently swallow network errors — the user still sees the success message
      // to avoid account enumeration.
    })

    setSubmitted(true)
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md animate-fade-in-up">
        {/* Back link */}
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-sm text-[#64748B] hover:text-[#334155] transition-colors mb-8"
        >
          <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Voltar para o login
        </Link>

        {/* Icon + heading */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#E41513] flex items-center justify-center shrink-0">
            <svg aria-hidden="true" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <div>
            <h1
              className="text-xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Recuperar senha
            </h1>
            <p className="text-sm text-[#64748B]">Enviaremos as instruções por e-mail</p>
          </div>
        </div>

        {submitted ? (
          /* Success state */
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-8 flex flex-col items-center text-center gap-4 animate-fade-in">
            <div className="w-14 h-14 rounded-full bg-[#D1FAE5] flex items-center justify-center">
              <svg className="w-7 h-7 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <div>
              <h2
                className="text-lg font-bold text-[#0F172A]"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Solicitação enviada
              </h2>
              <p className="mt-2 text-sm text-[#64748B] leading-relaxed">
                Se encontrarmos uma conta com as informações fornecidas e ela tiver
                um e-mail cadastrado, você receberá as instruções de recuperação em
                instantes.
              </p>
            </div>

            {/* Admin note */}
            <div className="w-full px-4 py-3 rounded-lg bg-[#F1F5F9] border border-[#E2E8F0] text-sm text-[#64748B] text-left leading-relaxed">
              <p className="font-semibold text-[#334155] mb-1">Não possui e-mail cadastrado?</p>
              Entre em contato com o administrador do sistema para solicitar a redefinição da sua senha.
            </div>

            <Link
              href="/login"
              className="mt-2 text-sm font-semibold text-[#E41513] hover:text-[#C01211] transition-colors"
            >
              Voltar para o login
            </Link>
          </div>
        ) : (
          /* Form state */
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 flex flex-col gap-5">
            <p className="text-sm text-[#64748B] leading-relaxed">
              Informe sua matrícula ou e-mail cadastrado. Se encontrarmos uma conta correspondente
              com e-mail registrado, enviaremos as instruções para redefinição de senha.
            </p>

            <div className="px-4 py-3 rounded-lg bg-[#FFF7ED] border border-[#FED7AA] flex items-start gap-2.5">
              <svg aria-hidden="true" className="w-4 h-4 text-[#D97706] mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p className="text-xs text-[#92400E] leading-relaxed">
                Usuários sem e-mail cadastrado precisam solicitar a redefinição diretamente ao administrador.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
              <Input
                label="Matrícula ou e-mail"
                type="text"
                id="identifier"
                autoComplete="username email"
                autoFocus
                placeholder="Ex: 12345 ou usuario@empresa.com"
                required
                error={errors.identifier?.message}
                {...register('identifier')}
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                loading={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Enviando…' : 'Enviar instruções'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
