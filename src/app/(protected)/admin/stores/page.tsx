'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRequireAuth } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { Table } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import type { Column } from '@/components/ui/Table'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Regional {
  id: string
  nome: string
  status: string
}

interface StoreRow {
  id: string
  codigo: string
  nome: string
  regional_id?: string | null
  status: 'ATIVO' | 'INATIVO'
  regional?: { nome: string } | null
  criado_em?: string
}

// ─── Store form schema ────────────────────────────────────────────────────────

const storeFormSchema = z.object({
  codigo: z.string().min(1, 'Código obrigatório'),
  nome: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  regionalId: z.string().optional(),
  status: z.enum(['ATIVO', 'INATIVO']),
})

type StoreFormData = z.infer<typeof storeFormSchema>

// ─── Store Form ────────────────────────────────────────────────────────────────

interface StoreFormProps {
  store?: StoreRow
  regionals: Regional[]
  onSuccess: () => void
  onCancel: () => void
}

function StoreForm({ store, regionals, onSuccess, onCancel }: StoreFormProps) {
  const isEditing = !!store
  const { success, error: showError } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeFormSchema),
    defaultValues: {
      codigo: store?.codigo ?? '',
      nome: store?.nome ?? '',
      regionalId: store?.regional_id ?? '',
      status: store?.status ?? 'ATIVO',
    },
  })

  const onSubmit = async (data: StoreFormData) => {
    try {
      const url = isEditing ? `/api/stores/${store.id}` : '/api/stores'
      const method = isEditing ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          codigo: data.codigo,
          nome: data.nome,
          regionalId: data.regionalId || undefined,
          status: data.status,
        }),
      })

      const body: { error?: string } = await res.json()

      if (!res.ok) {
        showError(body.error ?? 'Erro ao salvar loja.')
        return
      }

      success(isEditing ? 'Loja atualizada.' : 'Loja criada.')
      onSuccess()
    } catch {
      showError('Erro de conexão.')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Código */}
      <Input
        label="Código"
        id="store-codigo"
        required
        disabled={isEditing}
        placeholder="Ex: 001"
        error={errors.codigo?.message}
        {...register('codigo')}
      />

      {/* Nome */}
      <Input
        label="Nome da loja"
        id="store-nome"
        required
        placeholder="Ex: Loja Centro"
        error={errors.nome?.message}
        {...register('nome')}
      />

      {/* Regional */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="store-regional"
          className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]"
        >
          Regional
        </label>
        <select
          id="store-regional"
          className="w-full rounded-lg border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#0F172A] bg-white focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8] md:min-h-[48px] min-h-[44px]"
          {...register('regionalId')}
        >
          <option value="">Sem regional</option>
          {regionals.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Status */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="store-status"
          className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]"
        >
          Status <span className="text-[#E41513]" aria-hidden="true">*</span>
        </label>
        <select
          id="store-status"
          className="w-full rounded-lg border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#0F172A] bg-white focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8] md:min-h-[48px] min-h-[44px]"
          {...register('status')}
        >
          <option value="ATIVO">Ativo</option>
          <option value="INATIVO">Inativo</option>
        </select>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {isEditing ? 'Salvar alterações' : 'Criar loja'}
        </Button>
      </div>
    </form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminStoresPage() {
  const { authorized, loading: authLoading } = useRequireAuth({
    allowedProfiles: ['ADMIN'],
  })

  const { success, error: showError } = useToast()

  const [stores, setStores] = useState<StoreRow[]>([])
  const [regionals, setRegionals] = useState<Regional[]>([])
  const [loading, setLoading] = useState(false)

  const [createOpen, setCreateOpen] = useState(false)
  const [editStore, setEditStore] = useState<StoreRow | null>(null)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)

  // ── Fetch data ───────────────────────────────────────────────────────────────
  const fetchStores = useCallback(async () => {
    setLoading(true)
    try {
      // Use the admin stores endpoint that returns all stores (not just active)
      const res = await fetch('/api/stores?all=true', { credentials: 'include' })
      if (!res.ok) { showError('Erro ao carregar lojas.'); return }
      const body: { data: StoreRow[] } = await res.json()
      setStores(body.data)
    } catch {
      showError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }, [showError])

  const fetchRegionals = useCallback(async () => {
    try {
      const res = await fetch('/api/regions', { credentials: 'include' })
      if (!res.ok) return
      const body: { data: Regional[] } = await res.json()
      setRegionals(body.data)
    } catch {
      // Non-critical
    }
  }, [])

  useEffect(() => {
    if (authorized) {
      void fetchStores()
      void fetchRegionals()
    }
  }, [authorized, fetchStores, fetchRegionals])

  // ── Toggle status ─────────────────────────────────────────────────────────────
  const handleToggleStatus = async (store: StoreRow) => {
    setToggleLoading(store.id)
    const newStatus = store.status === 'ATIVO' ? 'INATIVO' : 'ATIVO'
    try {
      const res = await fetch(`/api/stores/${store.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      const body: { error?: string } = await res.json()
      if (!res.ok) { showError(body.error ?? 'Erro ao alterar status.'); return }
      success(`Loja ${newStatus === 'ATIVO' ? 'ativada' : 'desativada'}.`)
      void fetchStores()
    } catch {
      showError('Erro de conexão.')
    } finally {
      setToggleLoading(null)
    }
  }

  // ── Table columns ─────────────────────────────────────────────────────────────
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'codigo',
      header: 'Código',
      render: (v) => (
        <span className="font-mono text-xs font-medium text-[#334155]">{String(v)}</span>
      ),
    },
    {
      key: 'nome',
      header: 'Nome',
      render: (v) => (
        <span className="font-medium text-[#0F172A]">{String(v)}</span>
      ),
    },
    {
      key: 'regional',
      header: 'Regional',
      render: (_, row) => {
        const s = row as unknown as StoreRow
        return s.regional ? (
          <span className="text-xs text-[#64748B]">{s.regional.nome}</span>
        ) : null
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => {
        const s = String(v)
        return (
          <Badge variant={s === 'ATIVO' ? 'success' : 'neutral'}>
            {s === 'ATIVO' ? 'Ativa' : 'Inativa'}
          </Badge>
        )
      },
    },
    {
      key: 'id',
      header: 'Ações',
      render: (_, row) => {
        const s = row as unknown as StoreRow
        const isToggling = toggleLoading === s.id
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditStore(s)}
              aria-label={`Editar ${s.nome}`}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant={s.status === 'ATIVO' ? 'danger' : 'secondary'}
              loading={isToggling}
              onClick={() => void handleToggleStatus(s)}
              aria-label={s.status === 'ATIVO' ? `Desativar ${s.nome}` : `Ativar ${s.nome}`}
            >
              {s.status === 'ATIVO' ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        )
      },
    },
  ]

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-[#64748B]">
          {stores.length} loja{stores.length !== 1 ? 's' : ''} cadastrada{stores.length !== 1 ? 's' : ''}
        </p>
        <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
          + Nova Loja
        </Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={stores as never[]}
        loading={loading}
        emptyMessage="Nenhuma loja cadastrada."
        rowKey={(row) => (row as unknown as StoreRow).id}
      />

      {/* ── Create modal ── */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Nova Loja"
        size="md"
      >
        <StoreForm
          regionals={regionals}
          onSuccess={() => {
            setCreateOpen(false)
            void fetchStores()
          }}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* ── Edit modal ── */}
      <Modal
        open={!!editStore}
        onClose={() => setEditStore(null)}
        title="Editar Loja"
        size="md"
      >
        {editStore && (
          <StoreForm
            store={editStore}
            regionals={regionals}
            onSuccess={() => {
              setEditStore(null)
              void fetchStores()
            }}
            onCancel={() => setEditStore(null)}
          />
        )}
      </Modal>
    </div>
  )
}
