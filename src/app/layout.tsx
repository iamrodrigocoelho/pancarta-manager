import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Pancarta Manager',
  description: 'Criação e gestão de pancartas promocionais',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  )
}
