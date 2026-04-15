import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getKPIsNA2S, getTecnicosResumo } from '@/app/actions/dashboard'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CardKPI } from '@/components/dashboard/CardKPI'
import type { Pacote, StatusTecnico } from '@/types'

// ---- Helpers ----------------------------------------------------------------

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatMesLabel(mesRef: string) {
  const [ano, mes] = mesRef.split('-').map(Number)
  return new Date(ano, mes - 1, 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

const PACOTE_LABEL: Record<Pacote, string> = { starter: 'Starter', pro: 'Pro', full: 'Full' }

// ---- Página -----------------------------------------------------------------

export default async function AdminDashboard() {
  const [kpis, tecnicos] = await Promise.all([getKPIsNA2S(), getTecnicosResumo()])

  const tecnicosInadimplentes = tecnicos.filter((t) => t.status === 'inadimplente')

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
          {saudacao()}, Stephanie 👋
        </h1>
        <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', marginTop: '6px', marginBottom: 0 }}>
          {formatMesLabel(kpis.mesRef).charAt(0).toUpperCase() + formatMesLabel(kpis.mesRef).slice(1)} · {kpis.tecnicosAtivos} técnico{kpis.tecnicosAtivos !== 1 ? 's' : ''} ativo{kpis.tecnicosAtivos !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Linha 1 — Receita NA2S */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '16px' }}>
        <CardKPI
          label="Receita do mês"
          valor={formatCurrency(kpis.receitaMesAtual)}
          iconName="TrendingUp"
          href="/admin/financeiro"
        />
        <CardKPI
          label="Recebido"
          valor={formatCurrency(kpis.receitaRecebidaMes)}
          iconName="CheckCircle"
          href="/admin/financeiro"
        />
        <CardKPI
          label="Pendente"
          valor={formatCurrency(kpis.receitaPendenteMes)}
          cor={kpis.receitaPendenteMes > 0 ? 'var(--na2s-ambar)' : 'var(--na2s-lima)'}
          iconName="Clock"
          href="/admin/financeiro"
        />
      </div>

      {/* Linha 2 — Operacional */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '32px' }}>
        <CardKPI
          label="OS em aberto"
          valor={String(kpis.osAbertas)}
          iconName="ClipboardList"
          href="/admin/os?status=agendada"
          tamanho="metrica"
        />
        <CardKPI
          label="OS concluídas (mês)"
          valor={String(kpis.osConcluidas)}
          iconName="CheckSquare"
          href="/admin/os?status=concluida"
          tamanho="metrica"
        />
        <CardKPI
          label="Inadimplentes"
          valor={String(kpis.inadimplentesClientes)}
          cor={kpis.inadimplentesClientes > 0 ? 'var(--na2s-ambar)' : 'var(--na2s-lima)'}
          iconName="AlertTriangle"
          href="/admin/os?status_pagamento=inadimplente"
          tamanho="metrica"
        />
        <CardKPI
          label="Ticket médio"
          valor={formatCurrency(kpis.ticketMedioGeral)}
          iconName="BarChart2"
          href="/admin/financeiro"
          tamanho="metrica"
        />
      </div>

      {/* Linha 3 — Carteira de técnicos */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Técnicos ativos
          </h2>
          <Link
            href="/admin/tecnicos"
            style={{ fontSize: '13px', color: 'var(--na2s-lima)', textDecoration: 'none', fontWeight: 500 }}
          >
            Ver todos →
          </Link>
        </div>

        {tecnicos.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: 0 }}>Nenhum técnico cadastrado.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {tecnicos.map((t) => (
              <div
                key={t.id}
                style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
              >
                <div style={{ flex: 1, minWidth: '160px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--na2s-papel)', marginBottom: '4px' }}>
                    {t.nome}
                  </div>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ fontSize: '10px', fontWeight: 600, color: 'var(--na2s-texto-secundario)', borderRadius: '999px', padding: '2px 8px', border: '1px solid var(--na2s-borda)' }}>
                      {PACOTE_LABEL[t.pacote]}
                    </span>
                    <StatusBadge status={t.status as StatusTecnico} />
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: t.faturamento_mes > 0 ? 'var(--na2s-lima)' : 'var(--na2s-texto-mudo)', letterSpacing: '-0.5px' }}>
                    {formatCurrency(t.faturamento_mes)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--na2s-texto-secundario)' }}>faturamento mês</div>
                </div>

                <Link
                  href={`/admin/tecnicos/${t.id}`}
                  style={{ padding: '6px 16px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', color: 'var(--na2s-papel)', fontSize: '12px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Linha 4 — Alertas */}
      {(kpis.inadimplentesClientes > 0 || kpis.repassesPendentes > 0 || tecnicosInadimplentes.length > 0) && (
        <div
          style={{ backgroundColor: 'rgba(255,184,48,0.05)', border: '1px solid rgba(255,184,48,0.2)', borderRadius: '16px', padding: '20px 24px' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--na2s-ambar)', marginBottom: '12px' }}>
            ⚠ Atenção
          </div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {kpis.inadimplentesClientes > 0 && (
              <li>
                <Link
                  href="/admin/os?status_pagamento=inadimplente"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--na2s-papel)', textDecoration: 'none' }}
                  className="alert-link"
                >
                  {kpis.inadimplentesClientes} cliente{kpis.inadimplentesClientes !== 1 ? 's' : ''} com pagamento em atraso
                  <ArrowRight size={14} color="var(--na2s-ambar)" />
                </Link>
              </li>
            )}
            {kpis.repassesPendentes > 0 && (
              <li>
                <Link
                  href="/admin/financeiro#repasses"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--na2s-papel)', textDecoration: 'none' }}
                  className="alert-link"
                >
                  Repasses pendentes: {formatCurrency(kpis.repassesPendentes)}
                  <ArrowRight size={14} color="var(--na2s-ambar)" />
                </Link>
              </li>
            )}
            {tecnicosInadimplentes.map((t) => (
              <li key={t.id} style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>
                Técnico {t.nome} com mensalidade em atraso
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
