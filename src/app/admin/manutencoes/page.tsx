import Link from 'next/link'
import { Wrench } from 'lucide-react'
import { getEquipamentosComManutencao } from '@/app/actions/equipamentos'
import type { TipoEquipamento } from '@/types'

// ---- Helpers ----------------------------------------------------------------

const TIPO_EQUIP_LABEL: Record<TipoEquipamento, string> = {
  split: 'Split', cassete: 'Cassete', janela: 'Janela', multi_split: 'Multi-Split',
  pe_teto: 'Pé-Teto', comercial: 'Comercial', industrial: 'Industrial',
}

function formatDate(str: string) {
  return new Date(str + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

type GrupoUrgencia = 'vencida' | 'semana' | 'mes' | 'futura'

const GRUPO_CONFIG: Record<GrupoUrgencia, { label: string; cor: string; bg: string; borda: string }> = {
  vencida: { label: 'Vencida', cor: '#FFB830', bg: 'rgba(255,184,48,0.1)', borda: 'rgba(255,184,48,0.3)' },
  semana: { label: 'Esta semana', cor: '#FFB830', bg: 'rgba(255,184,48,0.08)', borda: 'rgba(255,184,48,0.25)' },
  mes: { label: 'Este mês', cor: '#C8FF57', bg: 'rgba(200,255,87,0.08)', borda: 'rgba(200,255,87,0.2)' },
  futura: { label: 'Futura', cor: '#5A6070', bg: 'rgba(90,96,112,0.1)', borda: 'rgba(90,96,112,0.25)' },
}

const GRUPO_TITULO: Record<GrupoUrgencia, string> = {
  vencida: '⚠ Vencidas',
  semana: 'Esta semana',
  mes: 'Este mês',
  futura: 'Próximas',
}

// ---- Página -----------------------------------------------------------------

export default async function ManutencoesPage() {
  const equipamentos = await getEquipamentosComManutencao()

  // Calcular datas de referência no servidor
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)
  const hojeStr = hoje.toISOString().split('T')[0]
  const semanaStr = new Date(hoje.getTime() + 7 * 86400000).toISOString().split('T')[0]
  const mesStr = new Date(hoje.getTime() + 30 * 86400000).toISOString().split('T')[0]

  function getGrupo(dataStr: string): GrupoUrgencia {
    if (dataStr < hojeStr) return 'vencida'
    if (dataStr < semanaStr) return 'semana'
    if (dataStr < mesStr) return 'mes'
    return 'futura'
  }

  // Agrupar
  const grupos: Record<GrupoUrgencia, typeof equipamentos> = {
    vencida: [], semana: [], mes: [], futura: [],
  }
  for (const eq of equipamentos) {
    grupos[getGrupo(eq.proxima_manutencao!)].push(eq)
  }

  const ordemGrupos: GrupoUrgencia[] = ['vencida', 'semana', 'mes', 'futura']
  const totalEquipamentos = equipamentos.length

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0 }}>
          Manutenções
        </h1>
        <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', margin: '6px 0 0' }}>
          {totalEquipamentos} equipamento{totalEquipamentos !== 1 ? 's' : ''} com manutenção programada
        </p>
      </div>

      {totalEquipamentos === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: '16px' }}>
          <Wrench size={48} color="var(--na2s-texto-mudo)" />
          <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', margin: 0 }}>
            Nenhuma manutenção programada.
          </p>
          <p style={{ color: 'var(--na2s-texto-mudo)', fontSize: '13px', margin: 0, textAlign: 'center' }}>
            Configure a periodicidade nos equipamentos dos clientes.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {ordemGrupos.map((grupo) => {
            const lista = grupos[grupo]
            if (lista.length === 0) return null
            const cfg = GRUPO_CONFIG[grupo]

            return (
              <section key={grupo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                  <h2 style={{ color: grupo === 'vencida' ? 'var(--na2s-ambar)' : 'var(--na2s-papel)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
                    {GRUPO_TITULO[grupo]}
                  </h2>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: cfg.cor, backgroundColor: cfg.bg, border: `1px solid ${cfg.borda}`, borderRadius: '999px', padding: '2px 8px' }}>
                    {lista.length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {lista.map((eq) => {
                    const tipoLabel = TIPO_EQUIP_LABEL[eq.tipo as TipoEquipamento] ?? eq.tipo
                    const descEquip = [tipoLabel, eq.marca, eq.btus ? `${eq.btus} BTUs` : null, eq.ambiente ? `— ${eq.ambiente}` : null]
                      .filter(Boolean)
                      .join(' ')

                    return (
                      <div
                        key={eq.id}
                        style={{
                          backgroundColor: 'var(--na2s-ardosia)',
                          border: grupo === 'vencida'
                            ? '1px solid rgba(255,184,48,0.3)'
                            : '1px solid var(--na2s-borda)',
                          borderRadius: '12px',
                          padding: '16px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)', marginBottom: '2px' }}>
                              {eq.cliente?.nome ?? '—'}
                            </div>
                            {eq.cliente?.whatsapp && (
                              <a
                                href={`https://wa.me/55${eq.cliente.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontSize: '13px', color: 'var(--na2s-lima)', textDecoration: 'none' }}
                              >
                                {eq.cliente.whatsapp}
                              </a>
                            )}
                          </div>
                          <span style={{ display: 'inline-block', borderRadius: '999px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', color: cfg.cor, backgroundColor: cfg.bg, border: `1px solid ${cfg.borda}`, whiteSpace: 'nowrap', flexShrink: 0 }}>
                            {cfg.label}
                          </span>
                        </div>

                        <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>
                          {descEquip}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                          <div>
                            <div style={{ fontSize: '13px', color: 'var(--na2s-texto-terciario)', marginBottom: '2px' }}>
                              Próxima manutenção
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 600, color: grupo === 'vencida' ? 'var(--na2s-ambar)' : 'var(--na2s-papel)' }}>
                              {formatDate(eq.proxima_manutencao!)}
                            </div>
                            {eq.tecnico && (
                              <div style={{ fontSize: '12px', color: 'var(--na2s-texto-mudo)', marginTop: '2px' }}>
                                Técnico: {eq.tecnico.nome}
                              </div>
                            )}
                          </div>

                          <Link
                            href={`/admin/os?cliente_id=${eq.cliente_id}`}
                            style={{ padding: '8px 16px', borderRadius: '999px', border: 'none', backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontSize: '13px', fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            Abrir OS
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}
