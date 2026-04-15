'use client'

import { useState, Suspense } from 'react'
import Link from 'next/link'
import { ClipboardList, AlertTriangle } from 'lucide-react'
import { OSStatusBadge } from '@/components/ui/OSStatusBadge'
import { OSFiltros } from './OSFiltros'
import { AbrirOSModal } from './AbrirOSModal'
import type { OrdemServico, StatusOS, Tecnico } from '@/types'

const TIPO_SERVICO_LABEL: Record<string, string> = {
  instalacao: 'Instalação',
  manutencao: 'Manutenção',
  limpeza: 'Limpeza',
  reparo: 'Reparo',
  orcamento: 'Orçamento',
  outros: 'Outros',
}

const PAGAMENTO_LABEL: Record<string, string> = {
  pago: 'Pago',
  pendente: 'Pendente',
  inadimplente: 'Inadimplente',
}

function formatDatetime(str?: string | null) {
  if (!str) return '—'
  return new Date(str).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatCurrency(val?: number | null) {
  if (val == null) return null
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function PagamentoBadge({ status }: { status: string }) {
  const cores: Record<string, { cor: string; bg: string; borda: string }> = {
    pago: { cor: '#C8FF57', bg: 'rgba(200,255,87,0.1)', borda: 'rgba(200,255,87,0.25)' },
    pendente: { cor: '#FFB830', bg: 'rgba(255,184,48,0.1)', borda: 'rgba(255,184,48,0.25)' },
    inadimplente: { cor: '#FFB830', bg: 'rgba(255,184,48,0.15)', borda: 'rgba(255,184,48,0.4)' },
  }
  const c = cores[status] ?? cores.pendente
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', color: c.cor, backgroundColor: c.bg, border: `1px solid ${c.borda}` }}>
      {status === 'inadimplente' && <AlertTriangle size={10} />}
      {PAGAMENTO_LABEL[status] ?? status}
    </span>
  )
}

interface Props {
  ordens: OrdemServico[]
  tecnicos: Pick<Tecnico, 'id' | 'nome' | 'status'>[]
}

export function OSListagemClient({ ordens, tecnicos }: Props) {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0 }}>
            Ordens de Serviço
          </h1>
          <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', margin: '6px 0 0' }}>
            Gerencie todas as OS dos seus técnicos.
          </p>
        </div>
        <button
          onClick={() => setModalAberto(true)}
          style={{ backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', border: 'none', borderRadius: '999px', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
        >
          + Nova OS
        </button>
      </div>

      {/* Filtros */}
      <Suspense fallback={null}>
        <OSFiltros tecnicos={tecnicos} />
      </Suspense>

      {/* Lista */}
      {ordens.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: '16px' }}>
          <ClipboardList size={48} color="var(--na2s-texto-mudo)" />
          <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', margin: 0 }}>Nenhuma OS encontrada.</p>
          <button
            onClick={() => setModalAberto(true)}
            style={{ backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', border: 'none', borderRadius: '999px', padding: '10px 24px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Criar primeira OS
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {ordens.map((os) => (
            <div
              key={os.id}
              style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', padding: '16px' }}
            >
              {/* Linha 1: nº + badge status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', fontWeight: 500 }}>
                  OS #{String(os.numero_os).padStart(4, '0')}
                </span>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  {os.status === 'concluida' && os.status_pagamento && (
                    <PagamentoBadge status={os.status_pagamento} />
                  )}
                  <OSStatusBadge status={os.status as StatusOS} />
                </div>
              </div>

              {/* Linha 2: cliente */}
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--na2s-papel)', marginBottom: '4px' }}>
                {os.cliente?.nome ?? '—'}
              </div>

              {/* Linha 3: tipo + data */}
              <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>
                {os.tipo_servico ? TIPO_SERVICO_LABEL[os.tipo_servico] : '—'}
                {os.data_agendamento && (
                  <> · {formatDatetime(os.data_agendamento)}</>
                )}
              </div>

              {/* Linha 4: valor (concluída) */}
              {os.status === 'concluida' && os.valor_cobrado != null && (
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-lima)', marginBottom: '4px' }}>
                  {formatCurrency(os.valor_cobrado)}
                </div>
              )}

              {/* Linha 5: técnico */}
              {os.tecnico && (
                <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '10px' }}>
                  Técnico: {os.tecnico.nome}
                </div>
              )}

              <Link
                href={`/admin/os/${os.id}`}
                style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 16px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', color: 'var(--na2s-papel)', fontSize: '13px', fontWeight: 500, textDecoration: 'none', transition: 'border-color 0.15s' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-texto-secundario)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-borda)')}
              >
                Abrir OS
              </Link>
            </div>
          ))}
        </div>
      )}

      {modalAberto && (
        <AbrirOSModal tecnicos={tecnicos} onClose={() => setModalAberto(false)} />
      )}
    </>
  )
}
