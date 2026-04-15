'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardList,
  DollarSign,
  Wrench,
  BarChart2,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exactMatch: true },
  { href: '/admin/tecnicos', label: 'Técnicos', icon: Users },
  { href: '/admin/clientes', label: 'Clientes', icon: UserCheck },
  { href: '/admin/os', label: 'Ordens de Serviço', icon: ClipboardList },
  { href: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
  { href: '/admin/manutencoes', label: 'Manutenções', icon: Wrench },
  { href: '/admin/wagner', label: 'Visão Wagner', icon: BarChart2, separador: true },
]

// 5 itens para bottom nav mobile (sem "Ordens de Serviço" por extenso)
const mobileItems = [
  { href: '/admin', label: 'Início', icon: LayoutDashboard, exactMatch: true },
  { href: '/admin/tecnicos', label: 'Técnicos', icon: Users },
  { href: '/admin/clientes', label: 'Clientes', icon: UserCheck },
  { href: '/admin/os', label: 'OS', icon: ClipboardList },
  { href: '/admin/financeiro', label: 'Financeiro', icon: DollarSign },
]

function isActive(pathname: string, href: string, exactMatch?: boolean) {
  if (exactMatch) return pathname === href
  return pathname.startsWith(href)
}

export function SidebarDesktop() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside
      style={{
        width: '240px',
        minHeight: '100vh',
        backgroundColor: 'var(--na2s-ardosia)',
        borderRight: '1px solid var(--na2s-borda)',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}
    >
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px' }}>
        <span
          style={{
            fontWeight: 700,
            fontSize: '24px',
            letterSpacing: '-2px',
            color: 'var(--na2s-papel)',
            lineHeight: 1,
          }}
        >
          NA<sup style={{ color: 'var(--na2s-lima)', fontSize: '13px', verticalAlign: 'super' }}>2</sup>S
        </span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {navItems.map(({ href, label, icon: Icon, exactMatch, separador }) => {
          const active = isActive(pathname, href, exactMatch)
          return (
            <div key={href}>
              {separador && (
                <div style={{ borderTop: '1px solid var(--na2s-borda)', margin: '6px 4px', opacity: 0.6 }} />
              )}
              <Link
                href={href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  color: active ? 'var(--na2s-lima)' : 'var(--na2s-texto-secundario)',
                  backgroundColor: active ? 'rgba(200,255,87,0.1)' : 'transparent',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'var(--na2s-borda)'
                    e.currentTarget.style.color = 'var(--na2s-papel)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.color = 'var(--na2s-texto-secundario)'
                  }
                }}
              >
                <Icon size={16} />
                {label}
              </Link>
            </div>
          )
        })}
      </nav>

      {/* Rodapé — Sair */}
      <div style={{ padding: '12px' }}>
        <button
          onClick={handleSignOut}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '10px 16px',
            borderRadius: '10px',
            width: '100%',
            border: 'none',
            backgroundColor: 'transparent',
            color: 'var(--na2s-texto-secundario)',
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--na2s-borda)'
            e.currentTarget.style.color = 'var(--na2s-papel)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
            e.currentTarget.style.color = 'var(--na2s-texto-secundario)'
          }}
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  )
}

export function BottomNavMobile() {
  const pathname = usePathname()

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        backgroundColor: 'var(--na2s-ardosia)',
        borderTop: '1px solid var(--na2s-borda)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 10,
      }}
    >
      {mobileItems.map(({ href, label, icon: Icon, exactMatch }) => {
        const active = isActive(pathname, href, exactMatch)
        return (
          <Link
            key={href}
            href={href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '3px',
              padding: '8px 12px',
              textDecoration: 'none',
              color: active ? 'var(--na2s-lima)' : 'var(--na2s-texto-secundario)',
            }}
          >
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400 }}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
