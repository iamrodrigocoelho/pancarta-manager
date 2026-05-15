'use client'

import React, { useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

// ─── Route title map ──────────────────────────────────────────────────────────

const routeTitles: { pattern: RegExp; title: string }[] = [
  { pattern: /^\/dashboard$/, title: 'Dashboard' },
  { pattern: /^\/posters\/new$/, title: 'Nova Pancarta' },
  { pattern: /^\/posters\/import$/, title: 'Importar CSV' },
  { pattern: /^\/posters\/history$/, title: 'Histórico' },
  { pattern: /^\/posters\/[^/]+$/, title: 'Pancarta' },
  { pattern: /^\/admin\/users\/import$/, title: 'Importar Usuários' },
  { pattern: /^\/admin\/users$/, title: 'Usuários' },
  { pattern: /^\/admin\/stores$/, title: 'Lojas' },
  { pattern: /^\/admin\/config$/, title: 'Configurações' },
]

function getPageTitle(pathname: string): string {
  for (const { pattern, title } of routeTitles) {
    if (pattern.test(pathname)) return title
  }
  return 'Pancarta Manager'
}

// ─── Hamburger icon ───────────────────────────────────────────────────────────

function HamburgerIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-5 h-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

// ─── Top bar (mobile) ─────────────────────────────────────────────────────────

function TopBar({
  title,
  onMenuOpen,
}: {
  title: string
  onMenuOpen: () => void
}) {
  return (
    <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E5E7EB] sticky top-0 z-20 shrink-0">
      <button
        onClick={onMenuOpen}
        aria-label="Abrir menu de navegação"
        className="flex items-center justify-center w-9 h-9 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#374151] transition-colors"
      >
        <HamburgerIcon />
      </button>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-6 h-6 rounded-md bg-[#C41E3A] flex items-center justify-center shrink-0">
          <svg aria-hidden="true" className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z" />
          </svg>
        </div>
        <h1 className="text-sm font-semibold text-[#111827] truncate font-['Sora',sans-serif]">
          {title}
        </h1>
      </div>
    </header>
  )
}

// ─── AppShell ─────────────────────────────────────────────────────────────────

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const openMenu = useCallback(() => setMobileMenuOpen(true), [])
  const closeMenu = useCallback(() => setMobileMenuOpen(false), [])

  const pageTitle = getPageTitle(pathname)

  return (
    <div className="min-h-dvh flex bg-[#F9FAFB]">
      {/* Sidebar */}
      <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={closeMenu} />

      {/* Content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <TopBar title={pageTitle} onMenuOpen={openMenu} />

        {/* Page header — desktop only */}
        <div className="hidden md:block px-6 pt-6 pb-2 shrink-0">
          <h1 className="text-2xl font-bold text-[#111827] font-['Sora',sans-serif]">
            {pageTitle}
          </h1>
        </div>

        {/* Main content */}
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
