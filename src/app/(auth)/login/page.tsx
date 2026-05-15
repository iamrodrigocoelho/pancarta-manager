'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

// ─── Schema ───────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  matricula: z.string().min(1, 'Matrícula é obrigatória'),
  password: z.string().min(1, 'Senha é obrigatória'),
})

type LoginFormData = z.infer<typeof loginSchema>

// ─── Brand panel ──────────────────────────────────────────────────────────────

function BrandPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#C41E3A] flex-col items-center justify-center p-12">
      {/* Diagonal stripe overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            'linear-gradient(135deg, rgba(0,0,0,0.18) 0%, transparent 50%, rgba(0,0,0,0.10) 100%)',
        }}
      />

      {/* Dot pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10"
        aria-hidden="true"
        style={{
          backgroundImage:
            'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Diagonal accent stripe */}
      <div
        className="absolute pointer-events-none"
        aria-hidden="true"
        style={{
          width: '200%',
          height: '120px',
          background: 'rgba(255,255,255,0.07)',
          transform: 'rotate(-20deg) translateY(-30px)',
          top: '30%',
          left: '-50%',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-6 max-w-sm">
        {/* Logo mark */}
        <div className="w-20 h-20 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm flex items-center justify-center shadow-xl">
          <svg
            aria-hidden="true"
            className="w-11 h-11 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
          </svg>
        </div>

        <div>
          <h1
            className="text-4xl font-extrabold text-white tracking-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Pancarta
            <br />
            Manager
          </h1>
          <p
            className="mt-3 text-white/75 text-base font-medium leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Gestão de Pancartas
            <br />
            Promocionais
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {['Criação rápida', 'Upload CSV', 'Geração de PDF', 'Auditoria'].map((feat) => (
            <span
              key={feat}
              className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white/80 text-xs font-medium"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <p
        className="relative z-10 absolute bottom-8 text-white/50 text-xs"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Acesso exclusivo para colaboradores autorizados
      </p>
    </div>
  )
}

// ─── Login Form ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const { error: showError } = useToast()
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      })

      const body: { error?: string; primeiroAcesso?: boolean } = await res.json()

      if (!res.ok) {
        setServerError(body.error ?? 'Erro ao fazer login. Tente novamente.')
        return
      }

      if (body.primeiroAcesso) {
        router.push('/first-access')
      } else {
        router.push('/dashboard')
      }
    } catch {
      const msg = 'Erro de conexão. Verifique sua internet e tente novamente.'
      setServerError(msg)
      showError(msg)
    }
  }

  return (
    <div className="min-h-dvh flex">
      <BrandPanel />

      {/* Form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white lg:w-1/2">
        <div className="w-full max-w-sm animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#C41E3A] flex items-center justify-center shrink-0">
              <svg aria-hidden="true" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
              </svg>
            </div>
            <div>
              <p
                className="text-sm font-bold text-[#111827] leading-tight"
                style={{ fontFamily: "'Sora', sans-serif" }}
              >
                Pancarta Manager
              </p>
              <p className="text-xs text-[#6B7280]">Gestão de Pancartas Promocionais</p>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-[#111827]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Bem-vindo de volta
            </h2>
            <p className="mt-1.5 text-sm text-[#6B7280]">
              Acesse com sua matrícula e senha
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-[#FDECEA] border border-[#FCA5A5] text-sm text-[#C41E3A]"
            >
              <svg
                aria-hidden="true"
                className="w-4 h-4 mt-0.5 shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{serverError}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
            <Input
              label="Matrícula"
              type="text"
              id="matricula"
              autoComplete="username"
              autoFocus
              placeholder="Ex: 12345"
              required
              error={errors.matricula?.message}
              {...register('matricula')}
            />

            <div className="flex flex-col gap-1.5">
              <Input
                label="Senha"
                type="password"
                id="password"
                autoComplete="current-password"
                placeholder="••••••••"
                required
                error={errors.password?.message}
                {...register('password')}
              />
              <div className="flex justify-end mt-0.5">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[#C41E3A] hover:text-[#9B1830] font-medium transition-colors"
                >
                  Esqueci minha senha
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting}
              className="w-full mt-1"
            >
              {isSubmitting ? 'Entrando…' : 'Entrar'}
            </Button>
          </form>

          {/* Footer note */}
          <p className="mt-8 text-center text-xs text-[#9CA3AF] leading-relaxed">
            Problemas para acessar?{' '}
            <span className="text-[#6B7280] font-medium">
              Entre em contato com o administrador do sistema.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
