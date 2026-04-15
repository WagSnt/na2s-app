'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil } from 'lucide-react'
import { OSStatusBadge } from '@/components/ui/OSStatusBadge'
import { NovoEquipamentoModal } from '@/components/equipamentos/NovoEquipamentoModal'
import { EditarClienteModal } from './EditarClienteModal'
import { useRouter } from 'next/navigation'
import type { Cliente, Equipamento, OrdemServico, StatusOS, TipoEquipamento } from '@/types'

// ---- Helpers ----------------------------------------------------------------

const TIPO_EQUIP_LABEL: Record<TipoEquipamento, string> = {
  split: 'Split', cassete: 'Cassete', janela: 'Janela', multi_split: 'Multi-Split',
  pe_teto: 'Pé-Teto', comercial: 'Comercial', industrial: 'Industrial',
}

const TIPO_SERVICO_LABEL: Record<string, string> = {
  instalacao: 'Instalação', manutencao: 'Manutenção', limpeza: 'Limpeza',
  reparo: 'Reparo', orcamento: 'Orçamento', outros: 'Outros',
}

function formatDate(str?: string | null) {
  if (!str) return '—'
  const d = str.includes('T') ? new Date(str) : new Date(str + 'T00:00:00')
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatCurrency(val?: number | null) {
  if (val == null) return null
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '15px', color: 'var(--na2s-papel)' }}>{value || '—'}</div>
    </div>
  )
}

// ---- Props ------------------------------------------------------------------

interface Props {
  cliente: Cliente & { tecnico: { nome: string } | null }
  equipamentos: Equipamento[]
  os: OrdemServico[]
}

// ---- Componente -------------------------------------------------------------

export function ClienteDetalheClient({ cliente, equipamentos, os }: Props) {
  const router = useRouter()
  const [editarAberto, setEditarAberto] = useState(false)
  const [novoEquipAberto, setNovoEquipAberto] = useState(false)

  const enderecoVazio =
    !cliente.endereco_rua && !cliente.endereco_bairro &&
    !cliente.endereco_cidade && !cliente.endereco_cep

  return (
    <>
      {/* Botão voltar */}
      <Link
        href={`/admin/tecnicos/${cliente.tecnico_id}`}
        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--na2s-texto-secundario)', textDecoration: 'none', fontSize: '14px', marginBottom: '20px', transition: 'color 0.15s' }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--na2s-papel)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--na2s-texto-secundario)')}
      >
        <ArrowLeft size={14} /> Clientes
      </Link>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>
            {cliente.nome}
          </h1>
          {cliente.tecnico && (
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: '4px 0 0' }}>
              Cliente de {cliente.tecnico.nome}
            </p>
          )}
        </div>
        <button
          onClick={() => setEditarAberto(true)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '9px 18px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-papel)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}
        >
          <Pencil size={13} />
          Editar
        </button>
      </div>

      {/* Card de informações */}
      <div
        style={{
          backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px',
        }}
      >
        {/* Contato */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Contato
          </div>
          <InfoItem
            label="WhatsApp"
            value={
              cliente.whatsapp ? (
                <a href={`https://wa.me/55${cliente.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--na2s-lima)', textDecoration: 'none' }}>
                  {cliente.whatsapp}
                </a>
              ) : null
            }
          />
          <InfoItem label="E-mail" value={cliente.email} />
          <InfoItem label="CPF" value={cliente.cpf} />
          <InfoItem label="Data de nascimento" value={formatDate(cliente.data_nascimento)} />
        </div>

        {/* Endereço */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            Endereço
          </div>
          {enderecoVazio ? (
            <p style={{ fontSize: '14px', color: '#5A6070', margin: 0 }}>Endereço não cadastrado</p>
          ) : (
            <>
              {(cliente.endereco_rua || cliente.endereco_numero) && (
                <InfoItem
                  label="Rua"
                  value={[cliente.endereco_rua, cliente.endereco_numero].filter(Boolean).join(', ')}
                />
              )}
              {(cliente.endereco_bairro || cliente.endereco_cidade) && (
                <InfoItem
                  label="Bairro / Cidade"
                  value={[cliente.endereco_bairro, cliente.endereco_cidade].filter(Boolean).join(', ')}
                />
              )}
              <InfoItem label="CEP" value={cliente.endereco_cep} />
            </>
          )}
        </div>
      </div>

      {/* Equipamentos */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Equipamentos
          </h2>
          <button
            onClick={() => setNovoEquipAberto(true)}
            style={{ backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', border: 'none', borderRadius: '999px', padding: '9px 20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            + Novo equipamento
          </button>
        </div>

        {equipamentos.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: 0 }}>Nenhum equipamento cadastrado.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {equipamentos.map((eq) => (
              <div key={eq.id} style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', padding: '14px 16px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)', marginBottom: '4px' }}>
                  {TIPO_EQUIP_LABEL[eq.tipo as TipoEquipamento] ?? eq.tipo}
                  {eq.marca ? ` ${eq.marca}` : ''}
                  {eq.btus ? ` — ${eq.btus} BTUs` : ''}
                </div>
                {eq.ambiente && (
                  <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '4px' }}>
                    {eq.ambiente}
                  </div>
                )}
                {eq.proxima_manutencao && (
                  <div style={{ fontSize: '12px', color: 'var(--na2s-texto-terciario)' }}>
                    Próx. manutenção: {formatDate(eq.proxima_manutencao)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* OS do cliente */}
      <div>
        <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: '0 0 16px' }}>
          Ordens de Serviço
        </h2>

        {os.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px' }}>
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: 0 }}>Nenhuma OS registrada.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {os.map((item) => (
              <div key={item.id} style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>
                      OS #{String(item.numero_os).padStart(4, '0')}
                    </span>
                    <OSStatusBadge status={item.status as StatusOS} />
                  </div>
                  {item.tipo_servico && (
                    <div style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>
                      {TIPO_SERVICO_LABEL[item.tipo_servico] ?? item.tipo_servico}
                    </div>
                  )}
                  <div style={{ fontSize: '12px', color: 'var(--na2s-texto-terciario)' }}>
                    {item.data_conclusao
                      ? `Concluída: ${formatDate(item.data_conclusao)}`
                      : item.data_agendamento
                      ? `Agendada: ${formatDate(item.data_agendamento)}`
                      : '—'}
                  </div>
                </div>
                {item.valor_cobrado != null && (
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-lima)' }}>
                    {formatCurrency(item.valor_cobrado)}
                  </div>
                )}
                <Link
                  href={`/admin/os/${item.id}`}
                  style={{ padding: '6px 14px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', color: 'var(--na2s-papel)', fontSize: '12px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Ver OS
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      {editarAberto && (
        <EditarClienteModal cliente={cliente} onClose={() => setEditarAberto(false)} />
      )}
      {novoEquipAberto && (
        <NovoEquipamentoModal
          cliente_id={cliente.id}
          tecnico_id={cliente.tecnico_id}
          onSuccess={() => router.refresh()}
          onClose={() => setNovoEquipAberto(false)}
        />
      )}
    </>
  )
}
