'use client'

import Link from 'next/link'
import {
  TrendingUp, CheckCircle, Clock, ClipboardList, CheckSquare,
  AlertTriangle, BarChart2,
} from 'lucide-react'

const ICONS = {
  TrendingUp,
  CheckCircle,
  Clock,
  ClipboardList,
  CheckSquare,
  AlertTriangle,
  BarChart2,
} as const

export type IconName = keyof typeof ICONS

interface Props {
  label: string
  valor: string          // já formatado pelo server component
  cor?: string
  iconName: IconName
  href: string
  tamanho?: 'receita' | 'metrica'   // receita=26px, metrica=40px
}

export function CardKPI({
  label, valor, cor = 'var(--na2s-lima)', iconName, href, tamanho = 'receita',
}: Props) {
  const Icon = ICONS[iconName]

  function onEnter(e: React.MouseEvent<HTMLDivElement>) {
    e.currentTarget.style.borderColor = 'rgba(200,255,87,0.3)'
    e.currentTarget.style.transform = 'translateY(-1px)'
    const tooltip = e.currentTarget.querySelector<HTMLElement>('.card-tooltip')
    if (tooltip) tooltip.style.opacity = '1'
  }

  function onLeave(e: React.MouseEvent<HTMLDivElement>) {
    e.currentTarget.style.borderColor = 'var(--na2s-borda)'
    e.currentTarget.style.transform = 'translateY(0)'
    const tooltip = e.currentTarget.querySelector<HTMLElement>('.card-tooltip')
    if (tooltip) tooltip.style.opacity = '0'
  }

  return (
    <Link href={href} style={{ textDecoration: 'none', display: 'block' }}>
      <div
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        style={{
          backgroundColor: 'var(--na2s-ardosia)',
          border: '1px solid var(--na2s-borda)',
          borderRadius: '16px',
          padding: '20px 24px',
          position: 'relative',
          transition: 'all 0.15s ease',
          cursor: 'pointer',
        }}
      >
        <div style={{ position: 'absolute', top: '18px', right: '18px', color: cor }}>
          <Icon size={18} />
        </div>
        <div
          style={{
            fontSize: tamanho === 'metrica' ? '40px' : '26px',
            fontWeight: 700,
            letterSpacing: tamanho === 'metrica' ? '-2px' : '-1.5px',
            color: cor,
            lineHeight: 1,
            marginBottom: '6px',
          }}
        >
          {valor}
        </div>
        <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>{label}</div>
        <div
          className="card-tooltip"
          style={{ fontSize: '11px', color: '#3D4450', marginTop: '6px', opacity: 0, transition: 'opacity 0.15s ease' }}
        >
          Ver detalhes →
        </div>
      </div>
    </Link>
  )
}
