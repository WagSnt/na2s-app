'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, Pencil } from 'lucide-react'
import { OSStatusBadge } from '@/components/ui/OSStatusBadge'
import { FecharOSModal } from './FecharOSModal'
import { EditarOSModal } from './EditarOSModal'
import { cancelarOS } from '@/app/actions/ordens-servico'
import { useRouter } from 'next/navigation'
import type { OrdemServico, StatusOS, TipoEquipamento } from '@/types'

const TIPO_SERVICO_LABEL: Record<string, string> = {
  instalacao: 'Instalação', manutencao: 'Manutenção', limpeza: 'Limpeza',
  reparo: 'Reparo', orcamento: 'Orçamento', outros: 'Outros',
}

const FORMA_PAGAMENTO_LABEL: Record<string, string> = {
  pix: 'PIX', dinheiro: 'Dinheiro', cartao_credito: 'Cartão de Crédito',
  cartao_debito: 'Cartão de Débito', boleto: 'Boleto', transferencia: 'Transferência',
}

const TIPO_EQUIP_LABEL: Record<TipoEquipamento, string> = {
  split: 'Split', cassete: 'Cassete', janela: 'Janela', multi_split: 'Multi-Split',
  pe_teto: 'Pé-Teto', comercial: 'Comercial', industrial: 'Industrial',
}

const PAGAMENTO_BADGE: Record<string, { cor: string; bg: string; borda: string }> = {
  pago: { cor: '#C8FF57', bg: 'rgba(200,255,87,0.1)', borda: 'rgba(200,255,87,0.25)' },
  pendente: { cor: '#FFB830', bg: 'rgba(255,184,48,0.1)', borda: 'rgba(255,184,48,0.25)' },
  inadimplente: { cor: '#FFB830', bg: 'rgba(255,184,48,0.15)', borda: 'rgba(255,184,48,0.4)' },
}

function formatDate(str?: string | null) {
  if (!str) return '—'
  const d = str.includes('T') ? new Date(str) : new Date(str + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatDatetime(str?: string | null) {
  if (!str) return '—'
  return new Date(str).toLocaleString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatCurrency(val?: number | null) {
  if (val == null) return '—'
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '15px', color: 'var(--na2s-papel)' }}>{value || '—'}</div>
    </div>
  )
}

export function OSDetalheClient({ os }: { os: OrdemServico }) {
  const router = useRouter()
  const [fecharAberto, setFecharAberto] = useState(false)
  const [editarAberto, setEditarAberto] = useState(false)
  const [cancelando, setCancelando] = useState(false)

  const podeFechar = os.status === 'agendada' || os.status === 'em_andamento'

  async function handleCancelar() {
    if (!confirm('Tem certeza que deseja cancelar esta OS?')) return
    setCancelando(true)
    await cancelarOS(os.id)
    router.refresh()
    setCancelando(false)
  }

  return (
    <>
      {/* Botão voltar */}
      <Link
        href="/admin/os"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--na2s-texto-secundario)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', transition: 'color 0.15s' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--na2s-papel)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--na2s-texto-secundario)')}
      >
        <ArrowLeft size={14} /> Ordens de Serviço
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
        <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0 }}>
          OS #{String(os.numero_os).padStart(4, '0')}
        </h1>
        <OSStatusBadge status={os.status as StatusOS} />
      </div>

      {/* Card de informações */}
      <div
        style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '16px', padding: '24px', marginBottom: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px' }}
      >
        {/* Coluna esquerda */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Informações
          </div>
          <InfoItem
            label="Cliente"
            value={os.cliente ? (
              <span>
                {os.cliente.nome}
                {os.cliente.whatsapp && (
                  <>
                    {' · '}
                    <a href={`https://wa.me/55${os.cliente.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--na2s-lima)', textDecoration: 'none' }}>
                      {os.cliente.whatsapp}
                    </a>
                  </>
                )}
              </span>
            ) : null}
          />
          <InfoItem label="Tipo de serviço" value={os.tipo_servico ? TIPO_SERVICO_LABEL[os.tipo_servico] : null} />
          <InfoItem label="Data agendada" value={formatDatetime(os.data_agendamento)} />
          <InfoItem label="Descrição da solicitação" value={os.descricao_solicitacao} />
        </div>

        {/* Coluna direita */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Execução
          </div>
          <InfoItem label="Técnico responsável" value={os.tecnico?.nome} />
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '6px' }}>Equipamentos</div>
            {os.equipamentos && os.equipamentos.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {os.equipamentos.map((eq) => (
                  <span key={eq.id} style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>
                    {TIPO_EQUIP_LABEL[eq.tipo]} {eq.marca ? `${eq.marca}` : ''}{eq.btus ? ` ${eq.btus} BTUs` : ''}{eq.ambiente ? ` — ${eq.ambiente}` : ''}
                  </span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: '14px', color: 'var(--na2s-texto-secundario)' }}>Nenhum equipamento vinculado</span>
            )}
          </div>
          <InfoItem label="Observações" value={os.observacoes} />
        </div>
      </div>

      {/* Ações (OS aberta) */}
      {podeFechar && (
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '24px' }}>
          <button
            onClick={() => setFecharAberto(true)}
            style={{ padding: '12px 24px', borderRadius: '999px', border: 'none', backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Registrar conclusão
          </button>
          <button
            onClick={() => setEditarAberto(true)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '12px 24px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-papel)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            <Pencil size={13} />
            Editar OS
          </button>
          <button
            onClick={handleCancelar}
            disabled={cancelando}
            style={{ padding: '12px 24px', borderRadius: '999px', border: '1px solid #FF4444', backgroundColor: 'transparent', color: '#FF4444', fontSize: '14px', fontWeight: 500, cursor: cancelando ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: cancelando ? 0.6 : 1 }}
          >
            {cancelando ? 'Cancelando...' : 'Cancelar OS'}
          </button>
        </div>
      )}

      {/* Card de conclusão */}
      {os.status === 'concluida' && (
        <div
          style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid rgba(200,255,87,0.2)', borderRadius: '16px', padding: '24px' }}
        >
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--na2s-lima)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Conclusão
          </div>

          <div style={{ marginBottom: '16px' }}>
            <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>O que foi feito</div>
            <div style={{ fontSize: '15px', color: 'var(--na2s-papel)', lineHeight: 1.6 }}>{os.o_que_foi_feito || '—'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>Valor cobrado</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--na2s-lima)', letterSpacing: '-1px' }}>
                {formatCurrency(os.valor_cobrado)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>Forma de pagamento</div>
              <div style={{ fontSize: '15px', color: 'var(--na2s-papel)' }}>
                {os.forma_pagamento ? FORMA_PAGAMENTO_LABEL[os.forma_pagamento] : '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '6px' }}>Status do pagamento</div>
              {os.status_pagamento ? (() => {
                const c = PAGAMENTO_BADGE[os.status_pagamento] ?? PAGAMENTO_BADGE.pendente
                return (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', borderRadius: '999px', fontSize: '11px', fontWeight: 600, padding: '3px 10px', color: c.cor, backgroundColor: c.bg, border: `1px solid ${c.borda}` }}>
                    {os.status_pagamento === 'inadimplente' && <AlertTriangle size={10} />}
                    {os.status_pagamento === 'pago' ? 'Pago' : os.status_pagamento === 'pendente' ? 'Pendente' : 'Inadimplente'}
                  </span>
                )
              })() : '—'}
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>Data do pagamento</div>
              <div style={{ fontSize: '15px', color: 'var(--na2s-papel)' }}>{formatDate(os.data_pagamento)}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>Comissão NA2S</div>
              <div style={{ fontSize: '15px', color: 'var(--na2s-texto-secundario)' }}>
                {os.comissao_pct != null ? `${os.comissao_pct}%` : '—'}
                {os.comissao_valor != null ? ` = ${formatCurrency(os.comissao_valor)}` : ''}
              </div>
            </div>
          </div>
        </div>
      )}

      {fecharAberto && (
        <FecharOSModal os_id={os.id} os_numero={os.numero_os} onClose={() => setFecharAberto(false)} />
      )}
      {editarAberto && (
        <EditarOSModal os={os} onClose={() => setEditarAberto(false)} />
      )}
    </>
  )
}
