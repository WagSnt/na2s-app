import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import { getKPIsNA2S, getTecnicosHistorico, getFinanceiroHistorico } from '@/app/actions/dashboard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Pacote, StatusTecnico } from '@/types'

// ---- Helpers ----------------------------------------------------------------

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatMes(mesRef: string) {
  const [ano, mes] = mesRef.split('-').map(Number)
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
}

function formatMesLongo(mesRef: string) {
  const [ano, mes] = mesRef.split('-').map(Number)
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

const PACOTE_LABEL: Record<Pacote, string> = { starter: 'Starter', pro: 'Pro', full: 'Full' }

function TrendIcon({ atual, anterior }: { atual: number; anterior: number }) {
  if (anterior === 0 && atual === 0) return <Minus size={14} color="var(--na2s-texto-mudo)" />
  if (atual > anterior) return <ArrowUpRight size={14} color="var(--na2s-lima)" />
  if (atual < anterior) return <ArrowDownRight size={14} color="var(--na2s-ambar)" />
  return <Minus size={14} color="var(--na2s-texto-mudo)" />
}

function KPICard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', padding: '16px 20px' }}>
      <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--na2s-lima)', letterSpacing: '-1px', lineHeight: 1, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>{label}</div>
      {sub && <div style={{ fontSize: '11px', color: 'var(--na2s-texto-mudo)', marginTop: '4px' }}>{sub}</div>}
    </div>
  )
}

// ---- Página -----------------------------------------------------------------

export default async function WagnerPage() {
  const [kpis, tecnicos, historico] = await Promise.all([
    getKPIsNA2S(),
    getTecnicosHistorico(3),
    getFinanceiroHistorico(3),
  ])

  const [mes0, mes1, mes2] = historico.map((h) => h.mes)

  // Métricas derivadas
  const taxaInadimplencia =
    kpis.osConcluidas > 0
      ? ((kpis.inadimplentesClientes / kpis.osConcluidas) * 100).toFixed(1)
      : '0.0'

  const faturamentoMedioTecnico =
    kpis.tecnicosAtivos > 0
      ? kpis.faturamentoTecnicosMes / kpis.tecnicosAtivos
      : 0

  const receitaAcumulada3m = historico.reduce((a, h) => a + h.receita, 0)

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px', flexWrap: 'wrap' }}>
          <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0 }}>
            Visão de gestão
          </h1>
          <span style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', backgroundColor: 'rgba(200,255,87,0.08)', border: '1px solid rgba(200,255,87,0.15)', borderRadius: '999px', padding: '3px 10px' }}>
            NA2S
          </span>
        </div>
        <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: 0 }}>
          {formatMesLongo(kpis.mesRef).charAt(0).toUpperCase() + formatMesLongo(kpis.mesRef).slice(1)}
        </p>
      </div>

      {/* KPIs expandidos */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: 'var(--na2s-papel)', fontSize: '16px', fontWeight: 700, margin: '0 0 14px', letterSpacing: '-0.3px' }}>
          Indicadores financeiros
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          <KPICard
            label="Receita acumulada (3 meses)"
            value={formatCurrency(receitaAcumulada3m)}
          />
          <KPICard
            label="Taxa de inadimplência"
            value={`${taxaInadimplencia}%`}
            sub={`${kpis.inadimplentesClientes} OS / ${kpis.osConcluidas} concluídas`}
          />
          <KPICard
            label="Faturamento médio / técnico"
            value={formatCurrency(faturamentoMedioTecnico)}
            sub={`${kpis.tecnicosAtivos} técnicos ativos`}
          />
          <KPICard
            label="Repasses pendentes"
            value={formatCurrency(kpis.repassesPendentes)}
          />
        </div>
      </section>

      {/* Histórico 3 meses */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ color: 'var(--na2s-papel)', fontSize: '16px', fontWeight: 700, margin: '0 0 14px', letterSpacing: '-0.3px' }}>
          Receita mês a mês
        </h2>
        <div style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', padding: '12px 16px', borderBottom: '1px solid var(--na2s-borda)' }}>
            {['Mês', 'Receita NA2S', 'Recebido', 'Fat. Técnicos'].map((col) => (
              <div key={col} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {col}
              </div>
            ))}
          </div>
          {historico.map((h, i) => (
            <div
              key={h.mes}
              style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr',
                padding: '14px 16px',
                borderBottom: i < historico.length - 1 ? '1px solid var(--na2s-borda)' : 'none',
                backgroundColor: i === 0 ? 'rgba(200,255,87,0.03)' : 'transparent',
              }}
            >
              <div style={{ fontSize: '14px', color: i === 0 ? 'var(--na2s-papel)' : 'var(--na2s-texto-secundario)', fontWeight: i === 0 ? 600 : 400 }}>
                {formatMes(h.mes).charAt(0).toUpperCase() + formatMes(h.mes).slice(1)}
                {i === 0 && <span style={{ fontSize: '10px', marginLeft: '6px', color: 'var(--na2s-lima)' }}>atual</span>}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>{formatCurrency(h.receita)}</div>
              <div style={{ fontSize: '14px', color: h.recebido >= h.receita && h.receita > 0 ? 'var(--na2s-lima)' : 'var(--na2s-papel)' }}>
                {formatCurrency(h.recebido)}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--na2s-texto-secundario)' }}>{formatCurrency(h.faturamento)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tabela de técnicos com histórico */}
      <section>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <h2 style={{ color: 'var(--na2s-papel)', fontSize: '16px', fontWeight: 700, margin: 0, letterSpacing: '-0.3px' }}>
            Performance por técnico
          </h2>
          <Link href="/admin/tecnicos" style={{ fontSize: '12px', color: 'var(--na2s-lima)', textDecoration: 'none' }}>
            Ver todos →
          </Link>
        </div>

        {tecnicos.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: 0 }}>Nenhum técnico cadastrado.</p>
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 80px 90px repeat(3, 1fr) 48px', padding: '12px 16px', borderBottom: '1px solid var(--na2s-borda)', gap: '8px' }}>
              {['Técnico', 'Pacote', 'Status', mes2 ? formatMes(mes2) : '—', mes1 ? formatMes(mes1) : '—', mes0 ? formatMes(mes0) : 'Atual', ''].map((col, i) => (
                <div key={i} style={{ fontSize: '11px', fontWeight: 600, color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  {col}
                </div>
              ))}
            </div>

            {tecnicos.map((t, idx) => {
              const fat0 = t.faturamento_por_mes[mes0] ?? 0
              const fat1 = t.faturamento_por_mes[mes1] ?? 0
              const fat2 = t.faturamento_por_mes[mes2] ?? 0

              return (
                <div
                  key={t.id}
                  style={{
                    display: 'grid', gridTemplateColumns: '1.5fr 80px 90px repeat(3, 1fr) 48px',
                    padding: '14px 16px', gap: '8px', alignItems: 'center',
                    borderBottom: idx < tecnicos.length - 1 ? '1px solid var(--na2s-borda)' : 'none',
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--na2s-papel)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {t.nome}
                  </div>
                  <div>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--na2s-texto-secundario)', borderRadius: '999px', padding: '2px 7px', border: '1px solid var(--na2s-borda)' }}>
                      {PACOTE_LABEL[t.pacote]}
                    </span>
                  </div>
                  <div>
                    <StatusBadge status={t.status as StatusTecnico} />
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
                    {fat2 > 0 ? formatCurrency(fat2) : '—'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
                    {fat1 > 0 ? formatCurrency(fat1) : '—'}
                  </div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: fat0 > 0 ? 'var(--na2s-papel)' : 'var(--na2s-texto-mudo)' }}>
                    {fat0 > 0 ? formatCurrency(fat0) : '—'}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <TrendIcon atual={fat0} anterior={fat1} />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
