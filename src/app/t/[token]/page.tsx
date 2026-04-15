import { getTecnicoPorToken } from '@/app/actions/tecnicos'
import { getOSDashboardTecnico } from '@/app/actions/ordens-servico'
import { OSStatusBadge } from '@/components/ui/OSStatusBadge'
import type { StatusOS, Pacote, TipoEquipamento } from '@/types'

interface Props {
  params: Promise<{ token: string }>
}

// ---- Helpers de formatação -----------------------------------------------

const PACOTE_LABEL: Record<Pacote, string> = { starter: 'Starter', pro: 'Pro', full: 'Full' }

const TIPO_SERVICO_LABEL: Record<string, string> = {
  instalacao: 'Instalação', manutencao: 'Manutenção', limpeza: 'Limpeza',
  reparo: 'Reparo', orcamento: 'Orçamento', outros: 'Outros',
}

const TIPO_EQUIP_LABEL: Record<TipoEquipamento, string> = {
  split: 'Split', cassete: 'Cassete', janela: 'Janela', multi_split: 'Multi-Split',
  pe_teto: 'Pé-Teto', comercial: 'Comercial', industrial: 'Industrial',
}

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatAgendamento(str: string | null) {
  if (!str) return '—'
  const d = new Date(str)
  const hoje = new Date()
  const amanha = new Date(hoje)
  amanha.setDate(hoje.getDate() + 1)

  const hora = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

  if (d.toDateString() === hoje.toDateString()) return `Hoje, ${hora}`
  if (d.toDateString() === amanha.toDateString()) return `Amanhã, ${hora}`

  return d.toLocaleDateString('pt-BR', {
    weekday: 'short', day: 'numeric', month: 'short',
  }) + `, ${hora}`
}

function formatManutencao(str: string) {
  const d = new Date(str + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function diasAte(str: string) {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const data = new Date(str + 'T00:00:00')
  return Math.round((data.getTime() - hoje.getTime()) / 86400000)
}

// ---- Componentes inline --------------------------------------------------

function Logo({ size = 18 }: { size?: number }) {
  return (
    <span style={{ fontWeight: 700, fontSize: `${size}px`, letterSpacing: '-1.5px', lineHeight: 1 }}>
      <span style={{ color: 'var(--na2s-papel)' }}>NA</span>
      <sup style={{ color: 'var(--na2s-lima)', fontSize: `${size * 0.55}px`, verticalAlign: 'super' }}>2</sup>
      <span style={{ color: 'var(--na2s-papel)' }}>S</span>
    </span>
  )
}

function SectionLabel({ children, cor = 'var(--na2s-texto-secundario)' }: { children: React.ReactNode; cor?: string }) {
  return (
    <p style={{ fontSize: '11px', fontWeight: 600, color: cor, letterSpacing: '0.15em', textTransform: 'uppercase', margin: '0 0 12px' }}>
      {children}
    </p>
  )
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', padding: '16px', ...style }}>
      {children}
    </div>
  )
}

// ---- Tela de link inválido -----------------------------------------------

function LinkInvalido() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '32px 16px' }}>
      <Logo size={24} />
      <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '16px', margin: 0, textAlign: 'center' }}>
        Link inválido ou expirado.
      </p>
      <p style={{ color: 'var(--na2s-texto-mudo)', fontSize: '13px', margin: 0, textAlign: 'center' }}>
        Entre em contato com sua equipe NA2S.
      </p>
    </div>
  )
}

// ---- Página principal ----------------------------------------------------

export default async function TecnicoDashboard({ params }: Props) {
  const { token } = await params

  const tecnicoData = await getTecnicoPorToken(token)
  if (!tecnicoData) return <LinkInvalido />

  const contratos = Array.isArray(tecnicoData.contratos)
    ? tecnicoData.contratos
    : tecnicoData.contratos
    ? [tecnicoData.contratos]
    : []
  const contrato = contratos[0] ?? null

  const dashboard = await getOSDashboardTecnico(tecnicoData.id)
  const { osAbertas, osDoMes, faturamentoMes, inadimplentes, proximasManutencoes } = dashboard

  const secao: React.CSSProperties = { padding: '0 16px' }

  return (
    <>
      {/* Header */}
      <header style={{ backgroundColor: 'var(--na2s-ardosia)', borderBottom: '1px solid var(--na2s-borda)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Logo size={18} />
        <div style={{ flex: 1, textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--na2s-papel)', lineHeight: 1.2 }}>
            {tecnicoData.nome}
          </div>
          {contrato && (
            <div style={{ fontSize: '11px', color: 'var(--na2s-texto-secundario)', marginTop: '2px' }}>
              Pacote {PACOTE_LABEL[tecnicoData.pacote as Pacote]}
            </div>
          )}
        </div>
        {/* espaço para balancear o logo */}
        <div style={{ width: '40px' }} />
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', paddingBottom: '32px' }}>

        {/* Seção 1 — Resumo do mês */}
        <section style={secao}>
          <SectionLabel>Este mês</SectionLabel>
          <div className="scroll-hide" style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            <Card style={{ minWidth: '140px', flexShrink: 0 }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--na2s-lima)', letterSpacing: '-1px', lineHeight: 1 }}>
                {formatCurrency(faturamentoMes)}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginTop: '6px' }}>
                Faturamento
              </div>
            </Card>

            <Card style={{ minWidth: '140px', flexShrink: 0 }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--na2s-lima)', letterSpacing: '-1px', lineHeight: 1 }}>
                {osDoMes.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginTop: '6px' }}>
                OS Concluídas
              </div>
            </Card>

            <Card style={{ minWidth: '140px', flexShrink: 0 }}>
              <div style={{ fontSize: '24px', fontWeight: 700, color: inadimplentes.length > 0 ? 'var(--na2s-ambar)' : 'var(--na2s-lima)', letterSpacing: '-1px', lineHeight: 1 }}>
                {inadimplentes.length}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginTop: '6px' }}>
                Inadimplentes
              </div>
            </Card>
          </div>
        </section>

        {/* Seção 2 — OS em aberto */}
        <section style={secao}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <SectionLabel>Em aberto</SectionLabel>
            {osAbertas.length > 0 && (
              <span style={{ display: 'inline-block', backgroundColor: 'rgba(200,255,87,0.15)', color: 'var(--na2s-lima)', fontSize: '11px', fontWeight: 700, borderRadius: '999px', padding: '2px 8px', marginTop: '-12px' }}>
                {osAbertas.length}
              </span>
            )}
          </div>

          {osAbertas.length === 0 ? (
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', textAlign: 'center', padding: '24px 0' }}>
              Nenhuma OS em aberto. 🎉
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {osAbertas.map((os) => (
                <Card key={os.id}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)' }}>
                      {os.cliente?.nome ?? '—'}
                    </div>
                    <OSStatusBadge status={os.status as StatusOS} />
                  </div>
                  {os.tipo_servico && (
                    <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>
                      {TIPO_SERVICO_LABEL[os.tipo_servico] ?? os.tipo_servico}
                    </div>
                  )}
                  <div style={{ fontSize: '13px', color: 'var(--na2s-texto-terciario)' }}>
                    {formatAgendamento(os.data_agendamento)}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Seção 3 — Inadimplência (só se houver) */}
        {inadimplentes.length > 0 && (
          <section style={secao}>
            <SectionLabel cor="var(--na2s-ambar)">Inadimplência</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {inadimplentes.map((os) => (
                <div key={os.id} style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid rgba(255,184,48,0.3)', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)', marginBottom: '4px' }}>
                    {os.cliente?.nome ?? '—'}
                  </div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--na2s-ambar)', marginBottom: '2px' }}>
                    {os.valor_cobrado != null ? formatCurrency(os.valor_cobrado) : '—'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--na2s-ambar)' }}>
                    Pagamento pendente
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Seção 4 — Próximas manutenções (só se houver) */}
        {proximasManutencoes.length > 0 && (
          <section style={secao}>
            <SectionLabel>Manutenções próximas</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {proximasManutencoes.map((eq) => {
                const dias = diasAte(eq.proxima_manutencao)
                const urgente = dias <= 7
                return (
                  <Card key={eq.id}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)' }}>
                        {eq.cliente?.nome ?? '—'}
                      </div>
                      <span style={{ display: 'inline-block', borderRadius: '999px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', whiteSpace: 'nowrap', color: urgente ? 'var(--na2s-ambar)' : 'var(--na2s-lima)', backgroundColor: urgente ? 'rgba(255,184,48,0.1)' : 'rgba(200,255,87,0.08)', border: `1px solid ${urgente ? 'rgba(255,184,48,0.3)' : 'rgba(200,255,87,0.2)'}` }}>
                        {urgente ? 'Urgente' : 'Próximo'}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>
                      {TIPO_EQUIP_LABEL[eq.tipo as TipoEquipamento] ?? eq.tipo}{eq.marca ? ` ${eq.marca}` : ''}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--na2s-texto-terciario)' }}>
                      {formatManutencao(eq.proxima_manutencao)}
                    </div>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {/* Rodapé */}
        <footer style={{ textAlign: 'center', paddingBottom: '32px' }}>
          <p style={{ fontSize: '11px', color: 'var(--na2s-texto-mudo)', margin: 0 }}>
            Powered by NA<sup style={{ fontSize: '7px' }}>2</sup>S
          </p>
        </footer>
      </div>
    </>
  )
}
