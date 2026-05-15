import React from 'react'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// ─── Types ────────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode
  value: number | string
  label: string
  accent?: 'red' | 'amber' | 'green' | 'blue'
}

interface ActionCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  accent?: boolean
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlusIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  )
}

function CogIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function DocumentChartIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ArrowDownTrayIcon() {
  return (
    <svg aria-hidden="true" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  )
}

function ArrowRightIcon() {
  return (
    <svg aria-hidden="true" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────

const accentConfig = {
  red: {
    bg: 'bg-[#FEE8E8]',
    icon: 'text-[#E41513]',
    value: 'text-[#E41513]',
  },
  amber: {
    bg: 'bg-[#FFF7ED]',
    icon: 'text-[#D97706]',
    value: 'text-[#D97706]',
  },
  green: {
    bg: 'bg-[#D1FAE5]',
    icon: 'text-[#059669]',
    value: 'text-[#059669]',
  },
  blue: {
    bg: 'bg-[#EFF6FF]',
    icon: 'text-[#2563EB]',
    value: 'text-[#2563EB]',
  },
}

function StatCard({ icon, value, label, accent = 'red' }: StatCardProps) {
  const cfg = accentConfig[accent]

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] p-5 flex items-center gap-4 shadow-sm">
      <div className={['w-12 h-12 rounded-xl flex items-center justify-center shrink-0', cfg.bg, cfg.icon].join(' ')}>
        {icon}
      </div>
      <div>
        <p className={['text-2xl font-extrabold leading-none', cfg.value].join(' ')} style={{ fontFamily: "'Sora', sans-serif" }}>
          {value}
        </p>
        <p className="mt-1 text-xs text-[#64748B] font-medium">{label}</p>
      </div>
    </div>
  )
}

// ─── Action card ──────────────────────────────────────────────────────────────

function ActionCard({ href, icon, title, description, accent = false }: ActionCardProps) {
  return (
    <Link
      href={href}
      className={[
        'group relative flex flex-col gap-3 rounded-2xl border p-5 min-h-[140px]',
        'transition-all duration-200 shadow-sm',
        'hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm',
        'focus-visible:outline-2 focus-visible:outline-[#E41513] focus-visible:outline-offset-2',
        accent
          ? 'bg-[#E41513] border-[#C01211] text-white'
          : 'bg-white border-[#E2E8F0] text-[#0F172A] hover:border-[#E41513]/30',
      ].join(' ')}
    >
      <div className={[
        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
        accent ? 'bg-white/15 text-white' : 'bg-[#FEE8E8] text-[#E41513]',
      ].join(' ')}>
        {icon}
      </div>

      <div className="flex-1">
        <p className={[
          'font-bold text-sm leading-tight',
          accent ? 'text-white' : 'text-[#0F172A]',
        ].join(' ')} style={{ fontFamily: "'Sora', sans-serif" }}>
          {title}
        </p>
        <p className={[
          'mt-1 text-xs leading-relaxed',
          accent ? 'text-white/75' : 'text-[#64748B]',
        ].join(' ')}>
          {description}
        </p>
      </div>

      <span className={[
        'absolute bottom-4 right-4 transition-transform duration-200 group-hover:translate-x-0.5',
        accent ? 'text-white/60' : 'text-[#94A3B8]',
      ].join(' ')}>
        <ArrowRightIcon />
      </span>
    </Link>
  )
}

// ─── Welcome banner ───────────────────────────────────────────────────────────

function WelcomeBanner({ nome, lojaNome, perfil }: { nome: string; lojaNome: string | null; perfil: string }) {
  const greeting = (() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Bom dia'
    if (hour < 18) return 'Boa tarde'
    return 'Boa noite'
  })()

  const profileLabel: Record<string, string> = {
    ADMIN: 'Administrador',
    AREA_CENTRAL: 'Área Central',
    LOJA: 'Usuário de Loja',
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#E41513] to-[#C01211] px-6 py-5 text-white shadow-md">
      {/* Pattern */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      />
      {/* Diagonal stripe */}
      <div
        className="absolute pointer-events-none opacity-10"
        aria-hidden="true"
        style={{
          width: '150%',
          height: '80px',
          background: 'rgba(255,255,255,0.3)',
          transform: 'rotate(-12deg)',
          top: '10px',
          right: '-20%',
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <p className="text-white/75 text-sm font-medium">{greeting},</p>
          <h2
            className="mt-0.5 text-xl font-extrabold leading-tight"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {nome}
          </h2>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-white/15 border border-white/20 text-xs font-semibold">
              {profileLabel[perfil] ?? perfil}
            </span>
            {lojaNome && (
              <span className="text-white/70 text-xs font-medium">{lojaNome}</span>
            )}
          </div>
        </div>

        {/* Large icon */}
        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 hidden sm:flex">
          <svg aria-hidden="true" className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3
      className="text-xs font-semibold uppercase tracking-widest text-[#94A3B8]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {children}
    </h3>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const session = await getSession()

  // Should never be null here (layout redirects), but satisfy TS.
  if (!session) return null

  const isAdmin = session.perfil === 'ADMIN'
  const isLoja = session.perfil === 'LOJA'

  // ── Fetch stats ────────────────────────────────────────────────────────────

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const lojaFilter = isLoja && session.lojaId
    ? { loja_id: session.lojaId }
    : {}

  const [totalHoje, pendingApproval, pdfsAvailable] = await Promise.all([
    prisma.poster.count({
      where: {
        ...lojaFilter,
        criado_em: { gte: todayStart },
        status: { notIn: ['EXPIRADA', 'CANCELADA'] },
      },
    }),
    prisma.poster.count({
      where: {
        ...lojaFilter,
        status: 'AGUARDANDO_CONFERENCIA',
      },
    }),
    prisma.pdfFile.count({
      where: {
        status: 'DISPONIVEL',
        expira_em: { gt: new Date() },
        ...(isLoja && session.lojaId
          ? { posters: { some: { loja_id: session.lojaId } } }
          : {}),
      },
    }),
  ])

  // ── Quick actions ──────────────────────────────────────────────────────────

  const mainActions = [
    {
      href: '/posters/new',
      icon: <PlusIcon />,
      title: 'Nova Pancarta',
      description: 'Crie uma pancarta promocional preenchendo os dados manualmente',
      accent: true,
    },
    {
      href: '/posters/import',
      icon: <UploadIcon />,
      title: 'Importar CSV',
      description: 'Importe um lote de pancartas a partir de um arquivo CSV',
      accent: false,
    },
    {
      href: '/posters/history',
      icon: <ClockIcon />,
      title: 'Histórico',
      description: 'Consulte pancartas recentes, baixe PDFs e acompanhe o status',
      accent: false,
    },
  ]

  const adminActions = [
    {
      href: '/admin/users',
      icon: <UsersIcon />,
      title: 'Gestão de Usuários',
      description: 'Crie, edite e gerencie usuários e perfis de acesso',
      accent: false,
    },
    {
      href: '/admin/config',
      icon: <CogIcon />,
      title: 'Configurações',
      description: 'Parâmetros do sistema, retenção de dados e modos de PDF',
      accent: false,
    },
  ]

  return (
    <div className="flex flex-col gap-6 stagger">
      {/* Welcome */}
      <WelcomeBanner
        nome={session.nome}
        lojaNome={session.lojaNome}
        perfil={session.perfil}
      />

      {/* Stats */}
      <div>
        <SectionHeading>Resumo de hoje</SectionHeading>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<DocumentChartIcon />}
            value={totalHoje}
            label="Pancartas criadas hoje"
            accent="red"
          />
          <StatCard
            icon={<CheckCircleIcon />}
            value={pendingApproval}
            label="Aguardando conferência"
            accent="amber"
          />
          <StatCard
            icon={<ArrowDownTrayIcon />}
            value={pdfsAvailable}
            label="PDFs disponíveis"
            accent="green"
          />
        </div>
      </div>

      {/* Main actions */}
      <div>
        <SectionHeading>Ações rápidas</SectionHeading>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainActions.map((action) => (
            <ActionCard key={action.href} {...action} />
          ))}
        </div>
      </div>

      {/* Admin-only section */}
      {isAdmin && (
        <div>
          <SectionHeading>Administração</SectionHeading>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {adminActions.map((action) => (
              <ActionCard key={action.href} {...action} />
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="text-center text-xs text-[#94A3B8] pb-2">
        Pancartas e PDFs são retidos por 2 dias e removidos automaticamente após esse período.
      </p>
    </div>
  )
}
