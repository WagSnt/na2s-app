import Link from 'next/link'
import {
  TrendingUp, CheckCircle, Clock, ClipboardList, CheckSquare,
  AlertTriangle, BarChart2,
} from 'lucide-react'
import { getKPIsNA2S, getTecnicosResumo } from '@/app/actions/dashboard'
import { StatusBadge } from '@/components/ui/StatusBadge'
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

// ---- Sub-components ---------------------------------------------------------

function CardReceita({
  label, valor, cor = 'var(--na2s-lima)', icon: Icon,
}: {
  label: string
  valor: number
  cor?: string
  icon: React.ComponentType<{ size: number }>
}) {
  return (
    <div style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '16px', padding: '20px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '18px', right: '18px', color: cor }}>
        <Icon size={18} />
      </div>
      <div style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-1.5px', color: cor, lineHeight: 1, marginBottom: '6px' }}>
        {formatCurrency(valor)}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>{label}</div>
    </div>
  )
}

function CardMetrica({
  label, valor, cor = 'var(--na2s-lima)', icon: Icon, formatado,
}: {
  label: string
  valor: number
  cor?: string
  icon: React.ComponentType<{ size: number }>
  formatado?: string
}) {
  return (
    <div style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '16px', padding: '20px 24px', position: 'relative' }}>
      <div style={{ position: 'absolute', top: '18px', right: '18px', color: cor }}>
        <Icon size={18} />
      </div>
      <div style={{ fontSize: '40px', fontWeight: 700, letterSpacing: '-2px', color: cor, lineHeight: 1, marginBottom: '6px' }}>
        {formatado ?? String(valor)}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>{label}</div>
    </div>
  )
}

// ---- Página -----------------------------------------------------------------

export default async function AdminDashboard() {
  const [kpis, tecnicos] = await Promise.all([getKPIsNA2S(), getTecnicosResumo()])

  const tecnicosInadimplentes = tecnicos.filter((t) => t.status === 'inadimplente')

  const alertas: string[] = []
  if (kpis.inadimplentesClientes > 0) {
    alertas.push(`${kpis.inadimplentesClientes} cliente${kpis.inadimplentesClientes !== 1 ? 's' : ''} com pagamento em atraso`)
  }
  if (kpis.repassesPendentes > 0) {
    alertas.push(`Repasses pendentes: ${formatCurrency(kpis.repassesPendentes)}`)
  }
  for (const t of tecnicosInadimplentes) {
    alertas.push(`Técnico ${t.nome} com mensalidade em atraso`)
  }

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
        <CardReceita label="Receita do mês" valor={kpis.receitaMesAtual} icon={TrendingUp} />
        <CardReceita label="Recebido" valor={kpis.receitaRecebidaMes} icon={CheckCircle} />
        <CardReceita
          label="Pendente"
          valor={kpis.receitaPendenteMes}
          cor={kpis.receitaPendenteMes > 0 ? 'var(--na2s-ambar)' : 'var(--na2s-lima)'}
          icon={Clock}
        />
      </div>

      {/* Linha 2 — Operacional */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px', marginBottom: '32px' }}>
        <CardMetrica label="OS em aberto" valor={kpis.osAbertas} icon={ClipboardList} />
        <CardMetrica label="OS concluídas (mês)" valor={kpis.osConcluidas} icon={CheckSquare} />
        <CardMetrica
          label="Inadimplentes"
          valor={kpis.inadimplentesClientes}
          cor={kpis.inadimplentesClientes > 0 ? 'var(--na2s-ambar)' : 'var(--na2s-lima)'}
          icon={AlertTriangle}
        />
        <CardMetrica
          label="Ticket médio"
          valor={kpis.ticketMedioGeral}
          formatado={formatCurrency(kpis.ticketMedioGeral)}
          icon={BarChart2}
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
                {/* Nome + badges */}
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

                {/* Faturamento */}
                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: t.faturamento_mes > 0 ? 'var(--na2s-lima)' : 'var(--na2s-texto-mudo)', letterSpacing: '-0.5px' }}>
                    {formatCurrency(t.faturamento_mes)}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--na2s-texto-secundario)' }}>faturamento mês</div>
                </div>

                {/* Ação */}
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
      {alertas.length > 0 && (
        <div
          style={{ backgroundColor: 'rgba(255,184,48,0.05)', border: '1px solid rgba(255,184,48,0.2)', borderRadius: '16px', padding: '20px 24px' }}
        >
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--na2s-ambar)', marginBottom: '12px' }}>
            ⚠ Atenção
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {alertas.map((alerta, i) => (
              <li key={i} style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>
                {alerta}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
