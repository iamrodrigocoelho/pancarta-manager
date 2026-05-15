'use client'

import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/components/ui/Toast'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface UserRow {
  id: string
  matricula: string
  nome: string
  email?: string | null
  perfil: 'ADMIN' | 'AREA_CENTRAL' | 'LOJA'
  status: 'ATIVO' | 'INATIVO'
  loja_id?: string | null
  regional_id?: string | null
  store?: { id: string; codigo: string; nome: string } | null
  regional?: { id: string; nome: string } | null
  primeiro_acesso?: boolean
  ultimo_login_em?: string | null
  criado_em?: string
}

export interface StoreOption {
  id: string
  codigo: string
  nome: string
  regional?: { nome: string } | null
}

interface UserFormProps {
  user?: UserRow
  stores: StoreOption[]
  onSuccess: () => void
  onCancel: () => void
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const userFormSchema = z
  .object({
    matricula: z.string().min(1, 'Matrícula obrigatória'),
    nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
    email: z.string().email('E-mail inválido').optional().or(z.literal('')),
    perfil: z.enum(['ADMIN', 'AREA_CENTRAL', 'LOJA'] as const, { error: 'Perfil inválido' }),
    lojaId: z.string().optional(),
    status: z.enum(['ATIVO', 'INATIVO'] as const),
  })
  .refine(
    (d) => d.perfil !== 'LOJA' || (d.lojaId !== undefined && d.lojaId !== ''),
    { message: 'Loja obrigatória para perfil LOJA', path: ['lojaId'] }
  )

type UserFormData = z.infer<typeof userFormSchema>

// ─── Component ────────────────────────────────────────────────────────────────

export function UserForm({ user, stores, onSuccess, onCancel }: UserFormProps) {
  const isEditing = !!user
  const { success, error: showError } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      matricula: user?.matricula ?? '',
      nome: user?.nome ?? '',
      email: user?.email ?? '',
      perfil: user?.perfil ?? 'LOJA',
      lojaId: user?.loja_id ?? '',
      status: user?.status ?? 'ATIVO',
    },
  })

  const perfil = watch('perfil')

  // Clear lojaId when perfil changes away from LOJA
  useEffect(() => {
    if (perfil !== 'LOJA') {
      setValue('lojaId', '')
    }
  }, [perfil, setValue])

  const onSubmit = async (data: UserFormData) => {
    try {
      const url = isEditing
        ? `/api/admin/users/${user.id}`
        : '/api/admin/users'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          matricula: data.matricula,
          nome: data.nome,
          email: data.email || undefined,
          perfil: data.perfil,
          lojaId: data.lojaId || undefined,
          status: data.status,
        }),
      })

      const body: { data?: { user?: unknown; tempPassword?: string }; error?: string } =
        await res.json()

      if (!res.ok) {
        showError(body.error ?? 'Erro ao salvar usuário.')
        return
      }

      if (!isEditing && body.data?.tempPassword) {
        success(
          `Usuário criado. Senha temporária: ${body.data.tempPassword}`,
          8000
        )
      } else {
        success(isEditing ? 'Usuário atualizado.' : 'Usuário criado.')
      }

      onSuccess()
    } catch {
      showError('Erro de conexão. Tente novamente.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Matrícula */}
      <Input
        label="Matrícula"
        id="user-matricula"
        required
        disabled={isEditing}
        placeholder="Ex: 12345"
        error={errors.matricula?.message}
        {...register('matricula')}
      />

      {/* Nome */}
      <Input
        label="Nome completo"
        id="user-nome"
        required
        placeholder="Ex: João da Silva"
        error={errors.nome?.message}
        {...register('nome')}
      />

      {/* E-mail */}
      <Input
        label="E-mail"
        id="user-email"
        type="email"
        placeholder="Ex: joao@empresa.com"
        helpText="Necessário para recuperação de senha por e-mail."
        error={errors.email?.message}
        {...register('email')}
      />

      {/* Perfil */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="user-perfil"
          className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]"
        >
          Perfil <span className="text-[#E41513]" aria-hidden="true">*</span>
        </label>
        <select
          id="user-perfil"
          className={[
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0F172A]',
            "font-['Plus_Jakarta_Sans',sans-serif] bg-white",
            'md:min-h-[48px] min-h-[44px] transition-colors duration-150',
            errors.perfil
              ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none'
              : 'border-[#CBD5E1] focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8]',
          ].join(' ')}
          {...register('perfil')}
        >
          <option value="ADMIN">Admin</option>
          <option value="AREA_CENTRAL">Área Central</option>
          <option value="LOJA">Loja</option>
        </select>
        {errors.perfil && (
          <p role="alert" className="text-xs text-[#DC2626]">
            {errors.perfil.message}
          </p>
        )}
      </div>

      {/* Loja (visible only when perfil = LOJA) */}
      {perfil === 'LOJA' && (
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="user-loja"
            className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]"
          >
            Loja <span className="text-[#E41513]" aria-hidden="true">*</span>
          </label>
          <select
            id="user-loja"
            className={[
              'w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0F172A]',
              "font-['Plus_Jakarta_Sans',sans-serif] bg-white",
              'md:min-h-[48px] min-h-[44px] transition-colors duration-150',
              errors.lojaId
                ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none'
                : 'border-[#CBD5E1] focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8]',
            ].join(' ')}
            {...register('lojaId')}
          >
            <option value="">Selecione uma loja…</option>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.codigo} — {s.nome}
                {s.regional ? ` (${s.regional.nome})` : ''}
              </option>
            ))}
          </select>
          {errors.lojaId && (
            <p role="alert" className="text-xs text-[#DC2626]">
              {errors.lojaId.message}
            </p>
          )}
        </div>
      )}

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="user-status"
          className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]"
        >
          Status <span className="text-[#E41513]" aria-hidden="true">*</span>
        </label>
        <select
          id="user-status"
          className={[
            'w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0F172A]',
            "font-['Plus_Jakarta_Sans',sans-serif] bg-white",
            'md:min-h-[48px] min-h-[44px] transition-colors duration-150',
            errors.status
              ? 'border-[#DC2626] focus:ring-2 focus:ring-[#DC2626]/20 focus:outline-none'
              : 'border-[#CBD5E1] focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8]',
          ].join(' ')}
          {...register('status')}
        >
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </select>
        {errors.status && (
          <p role="alert" className="text-xs text-[#DC2626]">
            {errors.status.message}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isEditing ? 'Salvar alterações' : 'Criar usuário'}
        </Button>
      </div>
    </form>
  )
}

export default UserForm
