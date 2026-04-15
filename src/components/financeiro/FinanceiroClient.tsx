'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { TrendingUp, DollarSign, CheckCircle, AlertTriangle, ChevronDown, ChevronUp, Download } from 'lucide-react'
import { GerarFinanceiroModal } from './GerarFinanceiroModal'
import { GerarRepasseModal } from './GerarRepasseModal'
import { atualizarStatusMensalidade, atualizarStatusRepasse, getFinanceiroMensal } from '@/app/actions/financeiro'
import type { FinanceiroMensal, Repasse, StatusPagamentoMensal, StatusRepasse, Tecnico, Pacote } from '@/types'
import type { FinanceiroConsolidado } from '@/app/actions/financeiro'

// ---- Helpers ----------------------------------------------------------------

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatMes(mesRef: string) {
  if (mesRef === 'todos') return 'Todos os meses'
  const [ano, mes] = mesRef.split('-').map(Number)
  const d = new Date(ano, mes - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function formatMesCompact(mesRef: string) {
  const [ano, mes] = mesRef.split('-').map(Number)
  const d = new Date(ano, mes - 1, 1)
  return d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function formatDate(str?: string | null) {
  if (!str) return '—'
  const d = str.includes('T') ? new Date(str) : new Date(str + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const PACOTE_LABEL: Record<Pacote, string> = { starter: 'Starter', pro: 'Pro', full: 'Full' }

// ---- Sub-components ---------------------------------------------------------

function MetricCard({
  label, value, cor = 'var(--na2s-lima)', icon: Icon,
}: {
  label: string
  value: string
  cor?: string
  icon: React.ComponentType<{ size: number; color?: string }>
}) {
  return (
    <div
      style={{
        backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)',
        borderRadius: '16px', padding: '20px 24px', position: 'relative',
      }}
    >
      <div style={{ position: 'absolute', top: '18px', right: '18px', color: cor }}>
        <Icon size={18} />
      </div>
      <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-1.5px', color: cor, lineHeight: 1, marginBottom: '6px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>{label}</div>
    </div>
  )
}

function StatusBadgePagamento({ status }: { status: StatusPagamentoMensal }) {
  const MAP: Record<StatusPagamentoMensal, { cor: string; bg: string; borda: string; label: string }> = {
    pago: { cor: '#C8FF57', bg: 'rgba(200,255,87,0.1)', borda: 'rgba(200,255,87,0.25)', label: 'Pago' },
    pendente: { cor: '#5A6070', bg: 'rgba(90,96,112,0.15)', borda: 'rgba(90,96,112,0.3)', label: 'Pendente' },
    inadimplente: { cor: '#FFB830', bg: 'rgba(255,184,48,0.1)', borda: 'rgba(255,184,48,0.3)', label: 'Inadimplente' },
  }
  const c = MAP[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', color: c.cor, backgroundColor: c.bg, border: `1px solid ${c.borda}`, whiteSpace: 'nowrap' }}>
      {status === 'inadimplente' && <AlertTriangle size={10} />}
      {c.label}
    </span>
  )
}

function StatusBadgeRepasse({ status }: { status: StatusRepasse }) {
  const MAP: Record<StatusRepasse, { cor: string; bg: string; borda: string; label: string }> = {
    pago: { cor: '#C8FF57', bg: 'rgba(200,255,87,0.1)', borda: 'rgba(200,255,87,0.25)', label: 'Pago' },
    pendente: { cor: '#5A6070', bg: 'rgba(90,96,112,0.15)', borda: 'rgba(90,96,112,0.3)', label: 'Pendente' },
    inadimplente: { cor: '#FFB830', bg: 'rgba(255,184,48,0.1)', borda: 'rgba(255,184,48,0.3)', label: 'Inadimplente' },
  }
  const c = MAP[status]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', color: c.cor, backgroundColor: c.bg, border: `1px solid ${c.borda}`, whiteSpace: 'nowrap' }}>
      {status === 'inadimplente' && <AlertTriangle size={10} />}
      {c.label}
    </span>
  )
}

// ---- Modal confirmação de pagamento -----------------------------------------

function ConfirmarPagamentoModal({
  titulo,
  onConfirmar,
  onClose,
}: {
  titulo: string
  onConfirmar: (data: string) => Promise<void>
  onClose: () => void
}) {
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [salvando, setSalvando] = useState(false)

  async function handleConfirmar() {
    setSalvando(true)
    await onConfirmar(data)
    setSalvando(false)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 60,
        backgroundColor: 'rgba(10,12,15,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !salvando) onClose() }}
    >
      <div style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '360px' }}>
        <h3 style={{ color: 'var(--na2s-papel)', fontSize: '17px', fontWeight: 700, margin: '0 0 8px' }}>
          {titulo}
        </h3>
        <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '13px', margin: '0 0 20px' }}>
          Confirme a data de pagamento.
        </p>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '8px' }}>
            Data do pagamento
          </label>
          <input
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--na2s-borda)', backgroundColor: 'var(--na2s-noite)', color: 'var(--na2s-papel)', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', colorScheme: 'dark' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            disabled={salvando}
            style={{ flex: 1, padding: '10px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-papel)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirmar}
            disabled={salvando}
            style={{ flex: 2, padding: '10px', borderRadius: '999px', border: 'none', backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontSize: '13px', fontWeight: 700, cursor: salvando ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: salvando ? 0.7 : 1 }}
          >
            {salvando ? 'Salvando...' : 'Confirmar pagamento'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ---- Linha de mensalidade ---------------------------------------------------

function LinhaMensalidade({
  registro,
  mostrarMes,
  onPago,
}: {
  registro: FinanceiroMensal
  mostrarMes: boolean
  onPago: () => void
}) {
  const [expandido, setExpandido] = useState(false)
  const [confirmarAberto, setConfirmarAberto] = useState(false)
  const [historico, setHistorico] = useState<FinanceiroMensal[] | null>(null)
  const [loadingHistorico, setLoadingHistorico] = useState(false)
  const [, startTransition] = useTransition()

  async function handleMarcarPago(dataPagamento: string) {
    await atualizarStatusMensalidade(registro.id, 'pago', dataPagamento)
    setConfirmarAberto(false)
    startTransition(() => onPago())
  }

  async function handleExpand() {
    const novoEstado = !expandido
    setExpandido(novoEstado)
    if (novoEstado && historico === null) {
      setLoadingHistorico(true)
      try {
        const data = await getFinanceiroMensal(registro.tecnico_id)
        setHistorico(data)
      } finally {
        setLoadingHistorico(false)
      }
    }
  }

  const podeMarcarPago = registro.status_mensalidade !== 'pago'

  return (
    <>
      <div
        style={{
          backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)',
          borderRadius: '12px', overflow: 'hidden',
        }}
      >
        <div
          onClick={handleExpand}
          role="button"
          style={{ padding: '14px 16px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)' }}>
                {registro.tecnico?.nome ?? '—'}
              </span>
              {registro.tecnico?.pacote && (
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--na2s-texto-secundario)', borderRadius: '999px', padding: '2px 8px', border: '1px solid var(--na2s-borda)' }}>
                  {PACOTE_LABEL[registro.tecnico.pacote as Pacote] ?? registro.tecnico.pacote}
                </span>
              )}
              {mostrarMes && (
                <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--na2s-lima)', borderRadius: '999px', padding: '2px 8px', border: '1px solid rgba(200,255,87,0.25)', backgroundColor: 'rgba(200,255,87,0.08)' }}>
                  {formatMesCompact(registro.mes_referencia)}
                </span>
              )}
              <StatusBadgePagamento status={registro.status_mensalidade} />
            </div>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>
                Fat. <strong style={{ color: 'var(--na2s-papel)' }}>{formatCurrency(registro.faturamento_bruto)}</strong>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>
                Mensalidade <strong style={{ color: 'var(--na2s-papel)' }}>{formatCurrency(registro.mensalidade_valor)}</strong>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>
                Comissão <strong style={{ color: 'var(--na2s-papel)' }}>{formatCurrency(registro.total_comissao_na2s)}</strong>
              </span>
              <span style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>
                Total <strong style={{ color: 'var(--na2s-lima)', fontSize: '13px' }}>{formatCurrency(registro.total_devido_na2s)}</strong>
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {podeMarcarPago && (
              <button
                onClick={(e) => { e.stopPropagation(); setConfirmarAberto(true) }}
                style={{ padding: '7px 14px', borderRadius: '999px', border: 'none', backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
              >
                Marcar pago
              </button>
            )}
            {expandido ? <ChevronUp size={16} color="var(--na2s-texto-secundario)" /> : <ChevronDown size={16} color="var(--na2s-texto-secundario)" />}
          </div>
        </div>

        {/* Detalhes expandidos */}
        {expandido && (
          <div style={{ borderTop: '1px solid var(--na2s-borda)', padding: '14px 16px' }}>
            {/* Info do mês atual */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--na2s-texto-secundario)', marginBottom: '2px' }}>OS concluídas</div>
                <div style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>{registro.num_os_concluidas}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--na2s-texto-secundario)', marginBottom: '2px' }}>Ticket médio</div>
                <div style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>{formatCurrency(registro.ticket_medio ?? 0)}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--na2s-texto-secundario)', marginBottom: '2px' }}>Vencimento</div>
                <div style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>{formatDate(registro.data_vencimento_mensalidade)}</div>
              </div>
              {registro.data_pagamento_mensalidade && (
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--na2s-texto-secundario)', marginBottom: '2px' }}>Pago em</div>
                  <div style={{ fontSize: '14px', color: 'var(--na2s-lima)' }}>{formatDate(registro.data_pagamento_mensalidade)}</div>
                </div>
              )}
            </div>

            {/* Histórico completo */}
            <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px' }}>
              Histórico de mensalidades
            </div>
            {loadingHistorico ? (
              <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', padding: '8px 0' }}>Carregando...</div>
            ) : historico && historico.length > 0 ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--na2s-borda)' }}>
                      {(['Mês', 'Faturamento', 'Mensalidade', 'Comissão', 'Total', 'Status', 'Pago em'] as const).map((h) => (
                        <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--na2s-texto-secundario)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((h) => (
                      <tr key={h.id} style={{ borderBottom: '1px solid rgba(90,96,112,0.15)' }}>
                        <td style={{ padding: '7px 8px', color: 'var(--na2s-papel)', whiteSpace: 'nowrap', fontWeight: 500 }}>
                          {formatMesCompact(h.mes_referencia)}
                        </td>
                        <td style={{ padding: '7px 8px', color: 'var(--na2s-papel)', whiteSpace: 'nowrap' }}>{formatCurrency(h.faturamento_bruto)}</td>
                        <td style={{ padding: '7px 8px', color: 'var(--na2s-papel)', whiteSpace: 'nowrap' }}>{formatCurrency(h.mensalidade_valor)}</td>
                        <td style={{ padding: '7px 8px', color: 'var(--na2s-papel)', whiteSpace: 'nowrap' }}>{formatCurrency(h.total_comissao_na2s)}</td>
                        <td style={{ padding: '7px 8px', color: 'var(--na2s-lima)', fontWeight: 700, whiteSpace: 'nowrap' }}>{formatCurrency(h.total_devido_na2s)}</td>
                        <td style={{ padding: '7px 8px', whiteSpace: 'nowrap' }}><StatusBadgePagamento status={h.status_mensalidade} /></td>
                        <td style={{ padding: '7px 8px', color: 'var(--na2s-texto-secundario)', whiteSpace: 'nowrap' }}>{formatDate(h.data_pagamento_mensalidade)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', padding: '8px 0' }}>Nenhum histórico encontrado.</div>
            )}
          </div>
        )}
      </div>

      {confirmarAberto && (
        <ConfirmarPagamentoModal
          titulo={`Marcar mensalidade de ${registro.tecnico?.nome} como paga`}
          onConfirmar={handleMarcarPago}
          onClose={() => setConfirmarAberto(false)}
        />
      )}
    </>
  )
}

// ---- Card de repasse --------------------------------------------------------

function CardRepasse({ repasse, onPago }: { repasse: Repasse; onPago: () => void }) {
  const [confirmarAberto, setConfirmarAberto] = useState(false)
  const [, startTransition] = useTransition()

  async function handleMarcarPago(dataPagamento: string) {
    await atualizarStatusRepasse(repasse.id, 'pago', dataPagamento)
    setConfirmarAberto(false)
    startTransition(() => onPago())
  }

  const d1 = new Date(repasse.periodo_inicio + 'T00:00:00')
  const d2 = new Date(repasse.periodo_fim + 'T00:00:00')
  const periodo = `${d1.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} – ${d2.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`

  return (
    <>
      <div style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)', marginBottom: '2px' }}>
              {repasse.tecnico?.nome ?? '—'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>{periodo}</div>
          </div>
          <StatusBadgeRepasse status={repasse.status} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--na2s-lima)', letterSpacing: '-0.5px', lineHeight: 1 }}>
              {formatCurrency(repasse.valor_comissao)}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--na2s-texto-secundario)', marginTop: '2px' }}>
              Vence {formatDate(repasse.data_vencimento)}
            </div>
          </div>
          {repasse.status !== 'pago' && (
            <button
              onClick={() => setConfirmarAberto(true)}
              style={{ padding: '7px 16px', borderRadius: '999px', border: 'none', backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
            >
              Marcar pago
            </button>
          )}
          {repasse.data_pagamento && (
            <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>
              Pago em {formatDate(repasse.data_pagamento)}
            </div>
          )}
        </div>
      </div>

      {confirmarAberto && (
        <ConfirmarPagamentoModal
          titulo={`Marcar repasse de ${repasse.tecnico?.nome} como pago`}
          onConfirmar={handleMarcarPago}
          onClose={() => setConfirmarAberto(false)}
        />
      )}
    </>
  )
}

// ---- Componente principal ---------------------------------------------------

interface Props {
  consolidado: FinanceiroConsolidado
  repasses: Repasse[]
  tecnicos: Pick<Tecnico, 'id' | 'nome' | 'status'>[]
  mes: string
}

export function FinanceiroClient({ consolidado, repasses, tecnicos, mes }: Props) {
  const router = useRouter()
  const [modalFinanceiro, setModalFinanceiro] = useState(false)
  const [modalRepasse, setModalRepasse] = useState(false)
  const [filtroTecnicoRepasse, setFiltroTecnicoRepasse] = useState('')

  const mostrarTodos = mes === 'todos'

  function handleMesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const params = new URLSearchParams({ mes: e.target.value })
    router.push(`/admin/financeiro?${params.toString()}`)
  }

  function toggleTodos() {
    if (mostrarTodos) {
      const mesRef = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
      router.push(`/admin/financeiro?mes=${mesRef}`)
    } else {
      router.push('/admin/financeiro?todos=1')
    }
  }

  function refresh() {
    router.refresh()
  }

  function exportarPDF() {
    const params = new URLSearchParams()
    if (!mostrarTodos) {
      params.set('mes_inicio', mes)
      params.set('mes_fim', mes)
    } else {
      // Últimos 3 meses
      const hoje = new Date()
      const fim = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
      hoje.setMonth(hoje.getMonth() - 2)
      const inicio = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
      params.set('mes_inicio', inicio)
      params.set('mes_fim', fim)
    }
    window.open(`/api/exportar-financeiro?${params.toString()}`, '_blank')
  }

  const { registros, total_faturamento, total_devido_na2s, total_recebido, count_inadimplentes } = consolidado

  const repassesFiltrados = filtroTecnicoRepasse
    ? repasses.filter((r) => r.tecnico_id === filtroTecnicoRepasse)
    : repasses

  return (
    <>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0 }}>
            Financeiro
          </h1>
          <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', margin: '6px 0 0' }}>
            Controle de mensalidades e repasses.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Toggle "Ver todos" */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: 'var(--na2s-texto-secundario)', userSelect: 'none' }}>
            <input
              type="checkbox"
              checked={mostrarTodos}
              onChange={toggleTodos}
              style={{ width: '15px', height: '15px', accentColor: 'var(--na2s-lima)', cursor: 'pointer' }}
            />
            Ver todos os meses
          </label>

          {!mostrarTodos && (
            <input
              type="month"
              value={mes}
              onChange={handleMesChange}
              style={{
                padding: '9px 12px', borderRadius: '8px',
                border: '1px solid var(--na2s-borda)', backgroundColor: 'var(--na2s-ardosia)',
                color: 'var(--na2s-papel)', fontSize: '14px', fontFamily: 'inherit', cursor: 'pointer',
                colorScheme: 'dark',
              }}
            />
          )}
          <button
            onClick={() => setModalFinanceiro(true)}
            style={{ backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', border: 'none', borderRadius: '999px', padding: '10px 20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
          >
            Gerar financeiro do mês
          </button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '32px' }}>
        <MetricCard
          label="Faturamento dos técnicos"
          value={formatCurrency(total_faturamento)}
          icon={TrendingUp}
        />
        <MetricCard
          label="A receber (NA2S)"
          value={formatCurrency(total_devido_na2s)}
          icon={DollarSign}
        />
        <MetricCard
          label="Recebido"
          value={formatCurrency(total_recebido)}
          icon={CheckCircle}
        />
        <MetricCard
          label="Inadimplentes"
          value={String(count_inadimplentes)}
          cor={count_inadimplentes > 0 ? 'var(--na2s-ambar)' : 'var(--na2s-lima)'}
          icon={AlertTriangle}
        />
      </div>

      {/* Tabela de mensalidades */}
      <section style={{ marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
          <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Mensalidades {mostrarTodos ? '— Todos os meses' : `— ${formatMes(mes)}`}
          </h2>
          <button
            onClick={exportarPDF}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-texto-secundario)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Download size={13} />
            Exportar PDF
          </button>
        </div>

        {registros.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: 0 }}>
              {mostrarTodos ? 'Nenhum registro financeiro encontrado.' : `Nenhum financeiro gerado para ${formatMes(mes)}.`}{' '}
              {!mostrarTodos && (
                <button onClick={() => setModalFinanceiro(true)} style={{ background: 'none', border: 'none', color: 'var(--na2s-lima)', cursor: 'pointer', fontSize: '14px', fontFamily: 'inherit', textDecoration: 'underline', padding: 0 }}>
                  Clique aqui para gerar.
                </button>
              )}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {registros.map((r) => (
              <LinhaMensalidade key={r.id} registro={r} mostrarMes={mostrarTodos} onPago={refresh} />
            ))}
          </div>
        )}
      </section>

      {/* Seção de repasses */}
      <section id="repasses">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Repasses
          </h2>
          <button
            onClick={() => setModalRepasse(true)}
            style={{ padding: '9px 20px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-papel)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
          >
            + Gerar repasse
          </button>
        </div>

        {/* Filtro de técnico nos repasses */}
        <div style={{ marginBottom: '16px' }}>
          <select
            value={filtroTecnicoRepasse}
            onChange={(e) => setFiltroTecnicoRepasse(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--na2s-borda)', backgroundColor: 'var(--na2s-ardosia)', color: 'var(--na2s-papel)', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer' }}
          >
            <option value="">Todos os técnicos</option>
            {tecnicos.map((t) => (
              <option key={t.id} value={t.id}>{t.nome}</option>
            ))}
          </select>
        </div>

        {repassesFiltrados.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: 0 }}>
              {filtroTecnicoRepasse ? 'Nenhum repasse para este técnico.' : 'Nenhum repasse gerado ainda.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {repassesFiltrados.map((r) => (
              <CardRepasse key={r.id} repasse={r} onPago={refresh} />
            ))}
          </div>
        )}
      </section>

      {/* Modais */}
      {modalFinanceiro && (
        <GerarFinanceiroModal
          tecnicos={tecnicos}
          mesInicial={mostrarTodos ? undefined : mes}
          onClose={() => { setModalFinanceiro(false); refresh() }}
        />
      )}
      {modalRepasse && (
        <GerarRepasseModal
          tecnicos={tecnicos}
          onClose={() => { setModalRepasse(false); refresh() }}
        />
      )}
    </>
  )
}
