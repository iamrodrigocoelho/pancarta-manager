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
    <div
      className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col items-center justify-center p-12"
      style={{ background: '#0F2240' }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: 'radial-gradient(ellipse 70% 60% at 50% 45%, rgba(37,80,122,0.55) 0%, transparent 70%)',
        }}
      />

      {/* Red accent line at bottom */}
      <div
        className="absolute bottom-0 left-0 right-0 h-1 pointer-events-none"
        aria-hidden="true"
        style={{ background: 'linear-gradient(90deg, transparent, #E41513, transparent)' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-xs">
        {/* Venancio logo */}
        <div className="flex flex-col items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/logo_venancio.svg"
            alt="Venancio"
            width={180}
            style={{ filter: 'brightness(0) invert(1)', opacity: 0.92 }}
          />
          <div className="h-px w-16 bg-white/15" />
          <p
            className="text-xs font-medium text-white/35 tracking-[0.15em] uppercase"
          >
            Pancarta Manager
          </p>
        </div>

        <div>
          <h1
            className="text-3xl font-extrabold text-white tracking-tight leading-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            Gestão de Pancartas
            <br />
            <span style={{ color: '#E41513' }}>Promocionais</span>
          </h1>
          <p className="mt-4 text-white/45 text-sm leading-relaxed">
            Crie, valide e distribua pancartas<br />de preço para toda a rede de lojas.
          </p>
        </div>

        {/* Feature chips */}
        <div className="flex flex-wrap justify-center gap-2">
          {['Criação rápida', 'Upload CSV', 'Geração de PDF', 'Auditoria'].map((feat) => (
            <span
              key={feat}
              className="px-3 py-1 rounded-full text-white/60 text-xs font-medium"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
            >
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* Bottom tagline */}
      <p className="relative z-10 absolute bottom-8 text-white/25 text-xs tracking-wide">
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
          <div className="flex flex-col gap-1 mb-8 lg:hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo_venancio.svg" alt="Venancio" width={130} />
            <p className="text-xs text-[#94A3B8] mt-1">Pancarta Manager</p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-2xl font-bold text-[#0F172A]"
              style={{ fontFamily: "'Sora', sans-serif" }}
            >
              Bem-vindo de volta
            </h2>
            <p className="mt-1.5 text-sm text-[#64748B]">
              Acesse com sua matrícula e senha
            </p>
          </div>

          {/* Server error */}
          {serverError && (
            <div
              role="alert"
              className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-lg bg-[#FEE8E8] border border-[#FCA5A5] text-sm text-[#E41513]"
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
                  className="text-xs text-[#E41513] hover:text-[#C01211] font-medium transition-colors"
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
          <p className="mt-8 text-center text-xs text-[#94A3B8] leading-relaxed">
            Problemas para acessar?{' '}
            <span className="text-[#64748B] font-medium">
              Entre em contato com o administrador do sistema.
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
