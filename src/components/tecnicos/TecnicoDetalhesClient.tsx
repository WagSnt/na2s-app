'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Copy, CheckCheck, UserCheck, ArrowLeft, Pencil } from 'lucide-react'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { OSStatusBadge } from '@/components/ui/OSStatusBadge'
import { NovoClienteModal } from '@/components/clientes/NovoClienteModal'
import { EditarTecnicoModal } from './EditarTecnicoModal'
import type { Tecnico, Contrato, Cliente, OrdemServico, Pacote, StatusTecnico, StatusOS } from '@/types'

const PACOTE_LABEL: Record<Pacote, string> = {
  starter: 'Starter',
  pro: 'Pro',
  full: 'Full',
}

const TIPO_SERVICO_LABEL: Record<string, string> = {
  instalacao: 'Instalação', manutencao: 'Manutenção', limpeza: 'Limpeza',
  reparo: 'Reparo', orcamento: 'Orçamento', outros: 'Outros',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatDatetime(str?: string | null) {
  if (!str) return '—'
  return new Date(str).toLocaleString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  if (!value) return null
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '15px', color: 'var(--na2s-papel)' }}>{value}</div>
    </div>
  )
}

interface Props {
  tecnico: Tecnico
  contrato: Contrato | null
  clientes: Cliente[]
  osAbertas: OrdemServico[]
  origin: string
}

export function TecnicoDetalhesClient({ tecnico, contrato, clientes, osAbertas, origin }: Props) {
  const [linkCopiado, setLinkCopiado] = useState(false)
  const [modalAberto, setModalAberto] = useState(false)
  const [editarAberto, setEditarAberto] = useState(false)

  const linkAcesso = `${origin}/t/${tecnico.token_acesso}`

  async function copiarLink() {
    await navigator.clipboard.writeText(linkAcesso)
    setLinkCopiado(true)
    setTimeout(() => setLinkCopiado(false), 2000)
  }

  return (
    <>
      {/* Botão voltar */}
      <Link
        href="/admin/tecnicos"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--na2s-texto-secundario)',
          textDecoration: 'none',
          fontSize: '14px',
          marginBottom: '20px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--na2s-papel)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--na2s-texto-secundario)')}
      >
        <ArrowLeft size={14} />
        Técnicos
      </Link>

      {/* Header: nome + badges */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0 }}>
            {tecnico.nome}
          </h1>
          <StatusBadge status={tecnico.status as StatusTecnico} />
          <span
            style={{
              display: 'inline-block',
              borderRadius: '999px',
              fontSize: '11px',
              fontWeight: 600,
              padding: '3px 10px',
              color: 'var(--na2s-texto-secundario)',
              backgroundColor: 'rgba(90,96,112,0.1)',
              border: '1px solid rgba(90,96,112,0.25)',
            }}
          >
            {PACOTE_LABEL[tecnico.pacote]}
          </span>
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
          backgroundColor: 'var(--na2s-ardosia)',
          border: '1px solid var(--na2s-borda)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '16px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Coluna: Contato */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--na2s-texto-terciario)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Contato
          </div>
          <InfoItem
            label="WhatsApp pessoal"
            value={
              <a
                href={`https://wa.me/55${tecnico.whatsapp_pessoal.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--na2s-lima)', textDecoration: 'none' }}
              >
                {tecnico.whatsapp_pessoal}
              </a>
            }
          />
          {tecnico.whatsapp_negocio && (
            <InfoItem
              label="WhatsApp negócio"
              value={
                <a
                  href={`https://wa.me/55${tecnico.whatsapp_negocio.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--na2s-lima)', textDecoration: 'none' }}
                >
                  {tecnico.whatsapp_negocio}
                </a>
              }
            />
          )}
          {tecnico.email && <InfoItem label="E-mail" value={tecnico.email} />}
          {tecnico.instagram && <InfoItem label="Instagram" value={tecnico.instagram} />}
        </div>

        {/* Coluna: Contrato */}
        <div>
          <div
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--na2s-texto-terciario)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: '16px',
            }}
          >
            Contrato
          </div>
          <InfoItem label="Pacote" value={contrato ? PACOTE_LABEL[contrato.pacote] : '—'} />
          <InfoItem
            label="Mensalidade"
            value={contrato ? formatCurrency(contrato.mensalidade_valor) : '—'}
          />
          <InfoItem
            label="Comissão"
            value={contrato ? `${contrato.comissao_pct}%` : '—'}
          />
          <InfoItem label="Início do contrato" value={formatDate(tecnico.data_inicio)} />
          <InfoItem
            label="Dia de cobrança"
            value={`Dia ${tecnico.dia_cobranca} de cada mês`}
          />
          {contrato?.eh_piloto && (
            <InfoItem
              label="Período piloto"
              value={
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    color: 'var(--na2s-lima)',
                    fontWeight: 600,
                  }}
                >
                  Mês piloto {contrato.mes_piloto_atual ?? 1}/3
                </span>
              }
            />
          )}
        </div>
      </div>

      {/* Link de acesso */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '8px' }}>
          Link de acesso do técnico
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: 'var(--na2s-noite)',
            border: '1px solid var(--na2s-borda)',
            borderRadius: '10px',
            padding: '12px 16px',
          }}
        >
          <span
            style={{
              flex: 1,
              fontSize: '14px',
              color: 'var(--na2s-papel)',
              wordBreak: 'break-all',
              fontFamily: 'monospace',
            }}
          >
            {linkAcesso}
          </span>
          <button
            onClick={copiarLink}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              border: '1px solid var(--na2s-borda)',
              backgroundColor: 'transparent',
              color: linkCopiado ? 'var(--na2s-lima)' : 'var(--na2s-papel)',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              transition: 'all 0.15s',
            }}
          >
            {linkCopiado ? <CheckCheck size={12} /> : <Copy size={12} />}
            {linkCopiado ? 'Copiado!' : 'Copiar'}
          </button>
        </div>
      </div>

      {/* Seção OS em aberto */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            OS em aberto
          </h2>
          <span style={{ display: 'inline-block', borderRadius: '999px', fontSize: '11px', fontWeight: 700, padding: '3px 10px', color: 'var(--na2s-noite)', backgroundColor: 'var(--na2s-lima)' }}>
            {osAbertas.length}
          </span>
        </div>

        {osAbertas.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px' }}>
            <p style={{ color: '#5A6070', fontSize: '14px', margin: 0 }}>Nenhuma OS em aberto. ✓</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {osAbertas.map((os) => (
              <div key={os.id} style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>
                      OS #{String(os.numero_os).padStart(4, '0')}
                    </span>
                    <OSStatusBadge status={os.status as StatusOS} />
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)', marginBottom: '2px' }}>
                    {os.cliente?.nome ?? '—'}
                  </div>
                  {os.tipo_servico && (
                    <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
                      {TIPO_SERVICO_LABEL[os.tipo_servico] ?? os.tipo_servico}
                    </div>
                  )}
                  {os.data_agendamento && (
                    <div style={{ fontSize: '12px', color: 'var(--na2s-texto-terciario)' }}>
                      {formatDatetime(os.data_agendamento)}
                    </div>
                  )}
                </div>
                <Link
                  href={`/admin/os/${os.id}`}
                  style={{ padding: '6px 14px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', color: 'var(--na2s-papel)', fontSize: '12px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Ver OS
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Seção de clientes */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
              Clientes
            </h2>
            <span style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px' }}>
              ({clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'})
            </span>
          </div>
          <button
            onClick={() => setModalAberto(true)}
            style={{
              backgroundColor: 'var(--na2s-lima)',
              color: 'var(--na2s-noite)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 20px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            + Novo cliente
          </button>
        </div>

        {clientes.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '48px 20px',
              gap: '12px',
              backgroundColor: 'var(--na2s-ardosia)',
              border: '1px solid var(--na2s-borda)',
              borderRadius: '16px',
            }}
          >
            <UserCheck size={40} color="var(--na2s-texto-mudo)" />
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: 0 }}>
              Nenhum cliente cadastrado para este técnico.
            </p>
            <button
              onClick={() => setModalAberto(true)}
              style={{
                backgroundColor: 'var(--na2s-lima)',
                color: 'var(--na2s-noite)',
                border: 'none',
                borderRadius: '999px',
                padding: '10px 24px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cadastrar primeiro cliente
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {clientes.map((cliente) => (
              <div
                key={cliente.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  backgroundColor: 'var(--na2s-ardosia)',
                  border: '1px solid var(--na2s-borda)',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)' }}>
                    {cliente.nome}
                  </div>
                  {cliente.whatsapp && (
                    <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginTop: '2px' }}>
                      {cliente.whatsapp}
                    </div>
                  )}
                </div>
                <Link
                  href={`/admin/clientes/${cliente.id}`}
                  style={{
                    padding: '6px 16px',
                    borderRadius: '999px',
                    border: '1px solid var(--na2s-borda)',
                    color: 'var(--na2s-papel)',
                    fontSize: '13px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'border-color 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-texto-secundario)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--na2s-borda)')}
                >
                  Ver
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal novo cliente */}
      {modalAberto && (
        <NovoClienteModal
          tecnico_id={tecnico.id}
          onClose={() => setModalAberto(false)}
        />
      )}
      {editarAberto && (
        <EditarTecnicoModal tecnico={tecnico} onClose={() => setEditarAberto(false)} />
      )}
    </>
  )
}
