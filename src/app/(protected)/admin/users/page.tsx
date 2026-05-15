'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useRequireAuth } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { Table } from '@/components/ui/Table'
import { useToast } from '@/components/ui/Toast'
import { UserForm, type UserRow, type StoreOption } from '@/components/admin/UserForm'
import type { Column } from '@/components/ui/Table'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UsersResponse {
  data: UserRow[]
  total: number
  page: number
  pageSize: number
}

// ─── Helper: profile label ────────────────────────────────────────────────────

const profileLabels: Record<string, string> = {
  ADMIN: 'Admin',
  AREA_CENTRAL: 'Área Central',
  LOJA: 'Loja',
}

const profileVariants: Record<string, 'info' | 'warning' | 'neutral'> = {
  ADMIN: 'info',
  AREA_CENTRAL: 'warning',
  LOJA: 'neutral',
}

// ─── Temp-password box ────────────────────────────────────────────────────────

function TempPasswordBox({
  password,
  emailSent,
}: {
  password: string
  emailSent: boolean
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(password)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-[#334155]">
        A senha temporária foi gerada. Copie e entregue ao usuário.
        {emailSent && (
          <span className="ml-1 text-emerald-600 font-medium">
            Um e-mail foi enviado automaticamente.
          </span>
        )}
      </p>
      <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] px-4 py-3">
        <code className="flex-1 font-mono text-sm text-[#0F172A] select-all break-all">
          {password}
        </code>
        <button
          onClick={() => void copy()}
          aria-label="Copiar senha"
          className="flex items-center gap-1.5 text-xs font-medium text-[#E41513] hover:text-[#C01211] transition-colors shrink-0"
        >
          {copied ? (
            <>
              <svg aria-hidden="true" className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Copiado
            </>
          ) : (
            <>
              <svg
                aria-hidden="true"
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copiar
            </>
          )}
        </button>
      </div>
      <p className="text-xs text-[#64748B]">
        O usuário será obrigado a trocar a senha no próximo acesso.
      </p>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const { authorized, loading: authLoading } = useRequireAuth({
    allowedProfiles: ['ADMIN'],
  })

  const { success, error: showError } = useToast()

  // ── Data state ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 20
  const [loading, setLoading] = useState(false)

  // ── Filter state ────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const searchRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Stores for form ─────────────────────────────────────────────────────────
  const [stores, setStores] = useState<StoreOption[]>([])

  // ── Modal state ─────────────────────────────────────────────────────────────
  const [createOpen, setCreateOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserRow | null>(null)
  const [confirmResetUser, setConfirmResetUser] = useState<UserRow | null>(null)
  const [resetLoading, setResetLoading] = useState(false)
  const [tempPasswordResult, setTempPasswordResult] = useState<{
    password: string
    emailSent: boolean
  } | null>(null)
  const [toggleLoading, setToggleLoading] = useState<string | null>(null)

  // ── Fetch users ─────────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(PAGE_SIZE),
        ...(search ? { search } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      })
      const res = await fetch(`/api/admin/users?${params}`, {
        credentials: 'include',
      })
      if (!res.ok) {
        showError('Erro ao carregar usuários.')
        return
      }
      const body: UsersResponse = await res.json()
      setUsers(body.data)
      setTotal(body.total)
    } catch {
      showError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }, [page, search, statusFilter, showError])

  // ── Fetch stores ─────────────────────────────────────────────────────────────
  const fetchStores = useCallback(async () => {
    try {
      const res = await fetch('/api/stores', { credentials: 'include' })
      if (!res.ok) return
      const body: { data: StoreOption[] } = await res.json()
      setStores(body.data)
    } catch {
      // Non-critical
    }
  }, [])

  useEffect(() => {
    if (authorized) {
      void fetchUsers()
    }
  }, [authorized, fetchUsers])

  useEffect(() => {
    if (authorized) {
      void fetchStores()
    }
  }, [authorized, fetchStores])

  // Debounce search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setSearch(val)
    setPage(1)
    if (searchRef.current) clearTimeout(searchRef.current)
    searchRef.current = setTimeout(() => {
      void fetchUsers()
    }, 350)
  }

  // ── Reset password ───────────────────────────────────────────────────────────
  const handleResetPassword = async () => {
    if (!confirmResetUser) return
    setResetLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${confirmResetUser.id}/reset-password`, {
        method: 'POST',
        credentials: 'include',
      })
      const body: { data?: { tempPassword: string; emailEnviado: boolean }; error?: string } =
        await res.json()

      if (!res.ok) {
        showError(body.error ?? 'Erro ao resetar senha.')
        return
      }

      setConfirmResetUser(null)
      setTempPasswordResult({
        password: body.data!.tempPassword,
        emailSent: body.data!.emailEnviado,
      })
    } catch {
      showError('Erro de conexão.')
    } finally {
      setResetLoading(false)
    }
  }

  // ── Toggle status ────────────────────────────────────────────────────────────
  const handleToggleStatus = async (user: UserRow) => {
    setToggleLoading(user.id)
    const newStatus = user.status === 'ATIVO' ? 'INATIVO' : 'ATIVO'
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      })
      const body: { error?: string } = await res.json()
      if (!res.ok) {
        showError(body.error ?? 'Erro ao alterar status.')
        return
      }
      success(`Usuário ${newStatus === 'ATIVO' ? 'ativado' : 'desativado'}.`)
      void fetchUsers()
    } catch {
      showError('Erro de conexão.')
    } finally {
      setToggleLoading(null)
    }
  }

  // ── Table columns ────────────────────────────────────────────────────────────
  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'matricula',
      header: 'Matrícula',
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
      key: 'perfil',
      header: 'Perfil',
      render: (v) => {
        const p = String(v)
        return (
          <Badge variant={profileVariants[p] ?? 'neutral'}>
            {profileLabels[p] ?? p}
          </Badge>
        )
      },
    },
    {
      key: 'store',
      header: 'Loja',
      render: (_, row) => {
        const store = (row as unknown as UserRow).store
        if (!store) return null
        return (
          <span className="text-xs text-[#64748B]">
            {store.codigo} — {store.nome}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (v) => {
        const s = String(v)
        return (
          <Badge variant={s === 'ATIVO' ? 'success' : 'neutral'}>
            {s === 'ATIVO' ? 'Ativo' : 'Inativo'}
          </Badge>
        )
      },
    },
    {
      key: 'ultimo_login_em',
      header: 'Último login',
      render: (v) => {
        if (!v) return null
        return (
          <span className="text-xs text-[#64748B]">
            {new Date(String(v)).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )
      },
    },
    {
      key: 'id',
      header: 'Ações',
      render: (_, row) => {
        const u = row as unknown as UserRow
        const isToggling = toggleLoading === u.id
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditUser(u)}
              aria-label={`Editar ${u.nome}`}
            >
              Editar
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setConfirmResetUser(u)}
              aria-label={`Resetar senha de ${u.nome}`}
            >
              Resetar senha
            </Button>
            <Button
              size="sm"
              variant={u.status === 'ATIVO' ? 'danger' : 'secondary'}
              loading={isToggling}
              onClick={() => void handleToggleStatus(u)}
              aria-label={u.status === 'ATIVO' ? `Desativar ${u.nome}` : `Ativar ${u.nome}`}
            >
              {u.status === 'ATIVO' ? 'Desativar' : 'Ativar'}
            </Button>
          </div>
        )
      },
    },
  ]

  // ── Pagination ────────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="w-full sm:w-72">
            <Input
              placeholder="Buscar por matrícula ou nome…"
              value={search}
              onChange={handleSearchChange}
              aria-label="Buscar usuários"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            aria-label="Filtrar por status"
            className="rounded-lg border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#0F172A] bg-white focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none min-h-[44px] md:min-h-[48px]"
          >
            <option value="">Todos os status</option>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-2 shrink-0">
          <Link href="/admin/users/import">
            <Button variant="secondary" size="md">
              Importar CSV
            </Button>
          </Link>
          <Button variant="primary" size="md" onClick={() => setCreateOpen(true)}>
            + Novo Usuário
          </Button>
        </div>
      </div>

      {/* Summary */}
      <p className="text-sm text-[#64748B]">
        {total} usuário{total !== 1 ? 's' : ''} encontrado{total !== 1 ? 's' : ''}
      </p>

      {/* Table */}
      <Table
        columns={columns}
        data={users as never[]}
        loading={loading}
        emptyMessage="Nenhum usuário encontrado."
        rowKey={(row) => (row as unknown as UserRow).id}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            disabled={page === 1 || loading}
            onClick={() => setPage((p) => p - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-[#64748B]">
            Página {page} de {totalPages}
          </span>
          <Button
            size="sm"
            variant="ghost"
            disabled={page === totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Próxima
          </Button>
        </div>
      )}

      {/* ── Create modal ── */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Novo Usuário"
        size="md"
      >
        <UserForm
          stores={stores}
          onSuccess={() => {
            setCreateOpen(false)
            void fetchUsers()
          }}
          onCancel={() => setCreateOpen(false)}
        />
      </Modal>

      {/* ── Edit modal ── */}
      <Modal
        open={!!editUser}
        onClose={() => setEditUser(null)}
        title="Editar Usuário"
        size="md"
      >
        {editUser && (
          <UserForm
            user={editUser}
            stores={stores}
            onSuccess={() => {
              setEditUser(null)
              void fetchUsers()
            }}
            onCancel={() => setEditUser(null)}
          />
        )}
      </Modal>

      {/* ── Reset password confirm modal ── */}
      <Modal
        open={!!confirmResetUser}
        onClose={() => setConfirmResetUser(null)}
        title="Resetar senha"
        size="sm"
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setConfirmResetUser(null)}
              disabled={resetLoading}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              loading={resetLoading}
              onClick={() => void handleResetPassword()}
            >
              Confirmar reset
            </Button>
          </>
        }
      >
        <p className="text-sm text-[#334155]">
          Tem certeza que deseja resetar a senha de{' '}
          <strong>{confirmResetUser?.nome}</strong>? Uma nova senha temporária será gerada e o
          usuário precisará trocá-la no próximo acesso.
        </p>
      </Modal>

      {/* ── Temp password result modal ── */}
      <Modal
        open={!!tempPasswordResult}
        onClose={() => setTempPasswordResult(null)}
        title="Senha temporária gerada"
        size="sm"
        footer={
          <Button variant="primary" onClick={() => setTempPasswordResult(null)}>
            Fechar
          </Button>
        }
      >
        {tempPasswordResult && (
          <TempPasswordBox
            password={tempPasswordResult.password}
            emailSent={tempPasswordResult.emailSent}
          />
        )}
      </Modal>
    </div>
  )
}
