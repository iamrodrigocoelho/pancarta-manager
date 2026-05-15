'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRequireAuth } from '@/hooks/useSession'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Spinner } from '@/components/ui/Spinner'
import { useToast } from '@/components/ui/Toast'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppConfigItem {
  id: string
  chave: string
  valor: string
  descricao?: string | null
  atualizado_em: string
}

// ─── Config key metadata ──────────────────────────────────────────────────────

type InputType = 'number' | 'select' | 'text'

interface ConfigMeta {
  label: string
  description: string
  inputType: InputType
  options?: { value: string; label: string }[]
  min?: number
  max?: number
  unit?: string
}

const CONFIG_META: Record<string, ConfigMeta> = {
  csv_max_rows: {
    label: 'Máximo de linhas CSV',
    description: 'Número máximo de linhas aceitas em um arquivo CSV de importação.',
    inputType: 'number',
    min: 1,
    max: 1000,
    unit: 'linhas',
  },
  retention_days: {
    label: 'Retenção de dados',
    description: 'Número de dias que pancartas e PDFs ficam disponíveis antes de expirar.',
    inputType: 'number',
    min: 1,
    max: 90,
    unit: 'dias',
  },
  pdf_generation_mode: {
    label: 'Modo de geração de PDF',
    description: 'Define como os PDFs são gerados quando há múltiplas pancartas selecionadas.',
    inputType: 'select',
    options: [
      { value: 'SINGLE_MULTIPAGE', label: 'PDF único com múltiplas páginas' },
      { value: 'INDIVIDUAL_FILES', label: 'Arquivos individuais por pancarta' },
      { value: 'ZIP_INDIVIDUAL_FILES', label: 'ZIP com PDFs individuais' },
    ],
  },
  password_reset_token_minutes: {
    label: 'Expiração do link de recuperação de senha',
    description: 'Tempo de validade do link enviado por e-mail para recuperação de senha.',
    inputType: 'number',
    min: 5,
    max: 1440,
    unit: 'minutos',
  },
  session_timeout_minutes: {
    label: 'Tempo de inatividade da sessão',
    description: 'Minutos de inatividade antes de expirar a sessão do usuário.',
    inputType: 'number',
    min: 5,
    max: 1440,
    unit: 'minutos',
  },
}

// ─── Config card ──────────────────────────────────────────────────────────────

interface ConfigCardProps {
  config: AppConfigItem
  onSaved: (updated: AppConfigItem) => void
}

function ConfigCard({ config, onSaved }: ConfigCardProps) {
  const { success, error: showError } = useToast()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(config.valor)
  const [saving, setSaving] = useState(false)

  const meta = CONFIG_META[config.chave]

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ chave: config.chave, valor: value }),
      })

      const body: { data?: AppConfigItem; error?: string } = await res.json()

      if (!res.ok) {
        showError(body.error ?? 'Erro ao salvar configuração.')
        return
      }

      success('Configuração salva.')
      setEditing(false)
      onSaved(body.data!)
    } catch {
      showError('Erro de conexão.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setValue(config.valor)
    setEditing(false)
  }

  const displayValue = () => {
    if (meta?.inputType === 'select') {
      return meta.options?.find((o) => o.value === config.valor)?.label ?? config.valor
    }
    if (meta?.unit) return `${config.valor} ${meta.unit}`
    return config.valor
  }

  return (
    <div className="rounded-xl border border-[#E2E8F0] bg-white p-5 flex flex-col gap-4 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#0F172A] text-sm font-['Plus_Jakarta_Sans',sans-serif]">
            {meta?.label ?? config.chave}
          </h3>
          <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
            {meta?.description ?? config.descricao ?? ''}
          </p>
          <p className="text-[10px] text-[#94A3B8] mt-1 font-mono">{config.chave}</p>
        </div>

        {!editing && (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>
            Editar
          </Button>
        )}
      </div>

      {/* Value / Edit */}
      {editing ? (
        <div className="flex flex-col gap-3">
          {meta?.inputType === 'select' ? (
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor={`config-${config.chave}`}
                className="text-sm font-medium text-[#334155] font-['Plus_Jakarta_Sans',sans-serif]"
              >
                Valor
              </label>
              <select
                id={`config-${config.chave}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full rounded-lg border border-[#CBD5E1] px-3.5 py-2.5 text-sm text-[#0F172A] bg-white focus:border-[#E41513] focus:ring-2 focus:ring-[#E41513]/20 focus:outline-none hover:border-[#94A3B8] md:min-h-[48px] min-h-[44px]"
              >
                {meta.options?.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <Input
              label="Valor"
              id={`config-${config.chave}`}
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              min={meta?.min}
              max={meta?.max}
              helpText={meta?.unit ? `Unidade: ${meta.unit}` : undefined}
            />
          )}

          <div className="flex items-center gap-2 justify-end">
            <Button size="sm" variant="ghost" onClick={handleCancel} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" variant="primary" loading={saving} onClick={() => void handleSave()}>
              Salvar
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[#E41513] font-['Plus_Jakarta_Sans',sans-serif]">
            {displayValue()}
          </span>
          <span className="text-xs text-[#94A3B8]">
            · atualizado em{' '}
            {new Date(config.atualizado_em).toLocaleString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            })}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminConfigPage() {
  const { authorized, loading: authLoading } = useRequireAuth({
    allowedProfiles: ['ADMIN'],
  })

  const { error: showError } = useToast()

  const [configs, setConfigs] = useState<AppConfigItem[]>([])
  const [loading, setLoading] = useState(false)

  const fetchConfigs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/config', { credentials: 'include' })
      if (!res.ok) { showError('Erro ao carregar configurações.'); return }
      const body: { data: AppConfigItem[] } = await res.json()
      setConfigs(body.data)
    } catch {
      showError('Erro de conexão.')
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    if (authorized) void fetchConfigs()
  }, [authorized, fetchConfigs])

  const handleSaved = (updated: AppConfigItem) => {
    setConfigs((prev) => prev.map((c) => (c.chave === updated.chave ? updated : c)))
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Intro */}
      <p className="text-sm text-[#64748B] leading-relaxed">
        Parâmetros globais do sistema. Alterações entram em vigor imediatamente para todos os
        usuários.
      </p>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Spinner size="lg" />
        </div>
      ) : configs.length === 0 ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-8 text-center text-sm text-[#64748B]">
          Nenhuma configuração encontrada. Execute o seed do banco de dados para criá-las.
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {/* Known keys first (in order), then unknown keys */}
          {Object.keys(CONFIG_META)
            .map((key) => configs.find((c) => c.chave === key))
            .filter((c): c is AppConfigItem => !!c)
            .concat(configs.filter((c) => !CONFIG_META[c.chave]))
            .map((config) => (
              <ConfigCard key={config.chave} config={config} onSaved={handleSaved} />
            ))}
        </div>
      )}
    </div>
  )
}
