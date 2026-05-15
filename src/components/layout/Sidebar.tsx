'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from '@/hooks/useSession'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'

// ─── Nav items ────────────────────────────────────────────────────────────────

interface NavItem {
  href: string
  label: string
  icon: React.ReactNode
  adminOnly?: boolean
  profiles?: ('ADMIN' | 'AREA_CENTRAL' | 'LOJA')[]
}

const ChartBarIcon = () => (
  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
  </svg>
)

const PlusCircleIcon = () => (
  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UploadIcon = () => (
  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
)

const ClockIcon = () => (
  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const UsersIcon = () => (
  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
  </svg>
)

const StoreIcon = () => (
  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
  </svg>
)

const CogIcon = () => (
  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

const LogoutIcon = () => (
  <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
  </svg>
)

const PersonIcon = () => (
  <svg aria-hidden="true" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
)

// ─── Nav items config ─────────────────────────────────────────────────────────

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard', icon: <ChartBarIcon /> },
  { href: '/posters/new', label: 'Nova Pancarta', icon: <PlusCircleIcon /> },
  { href: '/posters/import', label: 'Importar CSV', icon: <UploadIcon /> },
  { href: '/posters/history', label: 'Histórico', icon: <ClockIcon /> },
]

const adminNavItems: NavItem[] = [
  { href: '/admin/users', label: 'Usuários', icon: <UsersIcon />, adminOnly: true },
  { href: '/admin/stores', label: 'Lojas', icon: <StoreIcon />, adminOnly: true },
  { href: '/admin/config', label: 'Configurações', icon: <CogIcon />, adminOnly: true },
]

// ─── Profile label map ────────────────────────────────────────────────────────

const profileLabels: Record<string, string> = {
  ADMIN: 'Admin',
  AREA_CENTRAL: 'Área Central',
  LOJA: 'Loja',
}

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({
  item,
  pathname,
  onClick,
}: {
  item: NavItem
  pathname: string
  onClick?: () => void
}) {
  const isActive =
    item.href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname.startsWith(item.href)

  return (
    <Link
      href={item.href}
      onClick={onClick}
      aria-current={isActive ? 'page' : undefined}
      className={[
        'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
        'font-[\'DM_Sans\',sans-serif]',
        isActive
          ? 'bg-[#FDECEA] text-[#C41E3A] shadow-sm'
          : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151]',
      ].join(' ')}
    >
      <span className={isActive ? 'text-[#C41E3A]' : 'text-[#9CA3AF]'}>{item.icon}</span>
      {item.label}
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#C41E3A]" aria-hidden="true" />
      )}
    </Link>
  )
}

// ─── Sidebar content ──────────────────────────────────────────────────────────

function SidebarContent({
  onNavClick,
}: {
  onNavClick?: () => void
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { session } = useSession()
  const [loggingOut, setLoggingOut] = useState(false)

  const isAdmin = session?.perfil === 'ADMIN'

  const handleLogout = useCallback(async () => {
    setLoggingOut(true)
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    } finally {
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="flex flex-col h-full">
      {/* Logo / Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[#F3F4F6] shrink-0">
        <div className="w-8 h-8 rounded-lg bg-[#C41E3A] flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[#111827] font-['Sora',sans-serif] leading-tight">
            Pancarta
          </p>
          <p className="text-xs text-[#6B7280]">Manager</p>
        </div>
      </div>

      {/* Nav */}
      <nav aria-label="Menu principal" className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} onClick={onNavClick} />
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-1 px-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-[#D1D5DB]">
                Administração
              </p>
            </div>
            {adminNavItems.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} onClick={onNavClick} />
            ))}
          </>
        )}
      </nav>

      {/* User footer */}
      <div className="border-t border-[#F3F4F6] px-4 py-4 shrink-0">
        {session ? (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#9CA3AF] shrink-0">
                <PersonIcon />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#111827] truncate font-['DM_Sans',sans-serif]">
                  {session.nome}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Badge status={undefined} variant="neutral" className="text-[10px] px-1.5 py-0.5">
                    {profileLabels[session.perfil] ?? session.perfil}
                  </Badge>
                  {session.lojaCode && (
                    <span className="text-[10px] text-[#6B7280] truncate">{session.lojaCode}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={loggingOut}
              aria-label="Sair da conta"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors disabled:opacity-50 font-['DM_Sans',sans-serif]"
            >
              {loggingOut ? (
                <Spinner size="sm" color="gray" />
              ) : (
                <LogoutIcon />
              )}
              Sair
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-2">
            <Spinner size="sm" />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Sidebar export ──────────────────────────────────────────────────────

export interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

export function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        aria-label="Sidebar de navegação"
        className="hidden md:flex flex-col w-60 shrink-0 bg-white border-r border-[#E5E7EB] sticky top-0 h-screen overflow-y-auto"
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile drawer ── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            aria-hidden="true"
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden animate-fade-in"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <aside
            aria-label="Sidebar de navegação móvel"
            className="fixed inset-y-0 left-0 w-72 bg-white border-r border-[#E5E7EB] z-50 md:hidden flex flex-col"
            style={{ animation: 'slideDown 0.25s ease both' }}
          >
            {/* Close button */}
            <button
              onClick={onMobileClose}
              aria-label="Fechar menu"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors z-10"
            >
              <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent onNavClick={onMobileClose} />
          </aside>
        </>
      )}
    </>
  )
}

export default Sidebar
