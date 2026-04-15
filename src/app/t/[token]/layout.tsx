import type { Metadata } from 'next'
import { Space_Grotesk } from 'next/font/google'
import '@/app/globals.css'

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'NA2S — Seu painel',
  description: 'Dashboard do técnico NA2S',
}

export default function TecnicoDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className={spaceGrotesk.variable}>
      <body
        style={{
          backgroundColor: 'var(--na2s-noite)',
          color: 'var(--na2s-papel)',
          fontFamily: 'var(--font-space-grotesk), var(--font-display)',
          margin: 0,
          padding: 0,
          minHeight: '100vh',
        }}
      >
        <div
          style={{
            maxWidth: '480px',
            margin: '0 auto',
            paddingBottom: '24px',
          }}
        >
          {children}
        </div>
      </body>
    </html>
  )
}
