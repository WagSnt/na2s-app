'use client'

import Link from 'next/link'
import { Phone, Calendar, Copy, CheckCheck } from 'lucide-react'
import { useState } from 'react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { StatusTecnico, Pacote } from '@/types'

const PACOTE_LABEL: Record<Pacote, string> = {
  starter: 'Starter',
  pro: 'Pro',
  full: 'Full',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

interface Props {
  id: string
  nome: string
  whatsapp_pessoal: string
  pacote: Pacote
  status: StatusTecnico
  data_inicio: string
  token_acesso: string
}

export function TecnicoCard({
  id,
  nome,
  whatsapp_pessoal,
  pacote,
  status,
  data_inicio,
  token_acesso,
}: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const url = `${window.location.origin}/t/${token_acesso}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--na2s-ardosia)',
        border: '1px solid var(--na2s-borda)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
      }}
    >
      {/* Linha 1: nome + badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
        <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--na2s-papel)', lineHeight: 1.3 }}>
          {nome}
        </span>
        <StatusBadge status={status} />
      </div>

      {/* Linha 2: pacote */}
      <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
        Pacote {PACOTE_LABEL[pacote]}
      </div>

      {/* Linha 3: WhatsApp */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
        <Phone size={13} />
        {whatsapp_pessoal}
      </div>

      {/* Linha 4: Data de início */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '8px' }}>
        <Calendar size={13} />
        Desde {formatDate(data_inicio)}
      </div>

      {/* Rodapé: botões */}
      <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '4px', borderTop: '1px solid var(--na2s-borda)' }}>
        <Link
          href={`/admin/tecnicos/${id}`}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
            borderRadius: '999px',
            border: '1px solid var(--na2s-borda)',
            color: 'var(--na2s-papel)',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'border-color 0.15s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-texto-secundario)')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-borda)')}
        >
          Ver detalhes
        </Link>

        <button
          onClick={handleCopy}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '8px 12px',
            borderRadius: '999px',
            border: '1px solid var(--na2s-borda)',
            backgroundColor: 'transparent',
            color: copied ? 'var(--na2s-lima)' : 'var(--na2s-papel)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            fontFamily: 'inherit',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!copied) e.currentTarget.style.borderColor = 'var(--na2s-texto-secundario)'
          }}
          onMouseLeave={(e) => {
            if (!copied) e.currentTarget.style.borderColor = 'var(--na2s-borda)'
          }}
        >
          {copied ? <CheckCheck size={13} /> : <Copy size={13} />}
          {copied ? 'Copiado!' : 'Copiar link'}
        </button>
      </div>
    </div>
  )
}
