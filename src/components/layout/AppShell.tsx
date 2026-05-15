'use client'

import React, { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

// ─── Route title map ──────────────────────────────────────────────────────────

const routeTitles: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/dashboard$/,            title: 'Dashboard' },
  { pattern: /^\/posters\/new$/,         title: 'Nova Pancarta' },
  { pattern: /^\/posters\/import$/,      title: 'Importar CSV' },
  { pattern: /^\/posters\/history$/,     title: 'Histórico' },
  { pattern: /^\/posters\/[^/]+$/,       title: 'Pancarta' },
  { pattern: /^\/admin\/users\/import$/, title: 'Importar Usuários' },
  { pattern: /^\/admin\/users$/,         title: 'Usuários' },
  { pattern: /^\/admin\/stores$/,        title: 'Lojas' },
  { pattern: /^\/admin\/config$/,        title: 'Configurações' },
]

function getPageTitle(pathname: string): string {
  for (const { pattern, title } of routeTitles) {
    if (pattern.test(pathname)) return title
  }
  return 'Pancarta Manager'
}

// ─── Top bar (mobile) ─────────────────────────────────────────────────────────

function TopBar({ title, onMenuOpen }: { title: string; onMenuOpen: () => void }) {
  return (
    <header
      className="md:hidden flex items-center gap-3 px-4 py-3 sticky top-0 z-20 shrink-0"
      style={{ background: '#0F2240', borderBottom: '1px solid rgba(255,255,255,0.07)' }}
    >
      <button
        onClick={onMenuOpen}
        aria-label="Abrir menu de navegação"
        className="flex items-center justify-center w-9 h-9 rounded-lg text-white/60 hover:text-white hover:bg-white/[0.08] transition-colors"
      >
        <svg aria-hidden="true" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo_venancio.svg"
          alt="Venancio"
          width={80}
          style={{ filter: 'brightness(0) invert(1)', opacity: 0.85 }}
        />
        <span className="text-white/25 text-sm select-none">·</span>
        <h1
          className="text-sm font-semibold text-white/80 truncate"
          style={{ fontFamily: "'Sora', sans-serif" }}
        >
          {title}
        </h1>
      </div>
    </header>
  )
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const openMenu  = useCallback(() => setMobileMenuOpen(true),  [])
  const closeMenu = useCallback(() => setMobileMenuOpen(false), [])

  const pageTitle = getPageTitle(pathname)

  return (
    <div className="min-h-dvh flex bg-[#F8FAFC]">
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={closeMenu} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopBar title={pageTitle} onMenuOpen={openMenu} />

        {/* Desktop page header */}
        <div className="hidden md:block px-6 pt-7 pb-1 shrink-0">
          <h1
            className="text-xl font-bold text-[#0F172A]"
            style={{ fontFamily: "'Sora', sans-serif" }}
          >
            {pageTitle}
          </h1>
        </div>

        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 py-4 md:px-6 md:py-6 min-h-0 focus:outline-none"
        >
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppShell
