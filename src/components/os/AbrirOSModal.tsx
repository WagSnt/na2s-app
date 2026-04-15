'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Plus } from 'lucide-react'
import { abrirOS } from '@/app/actions/ordens-servico'
import { NovoEquipamentoModal } from '@/components/equipamentos/NovoEquipamentoModal'
import type { Tecnico } from '@/types'

const INPUT_STYLE: React.CSSProperties = {
  backgroundColor: 'var(--na2s-noite)',
  border: '1px solid var(--na2s-borda)',
  borderRadius: '10px',
  padding: '12px 16px',
  color: 'var(--na2s-papel)',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
}

const LABEL_STYLE: React.CSSProperties = {
  display: 'block',
  fontSize: '13px',
  color: 'var(--na2s-texto-secundario)',
  marginBottom: '6px',
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: 'var(--na2s-texto-terciario)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  marginBottom: '12px',
  paddingBottom: '8px',
  borderBottom: '1px solid var(--na2s-borda)',
}

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-lima)'
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-borda)'
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>
        {label}
        {required && <span style={{ color: 'var(--na2s-lima)', marginLeft: '2px' }}>*</span>}
      </label>
      {children}
    </div>
  )
}

interface ClienteOpcao { id: string; nome: string; whatsapp?: string }
interface EquipamentoOpcao { id: string; tipo: string; marca?: string; btus?: number; ambiente?: string }

interface Props {
  tecnicos: Pick<Tecnico, 'id' | 'nome' | 'status'>[]
  onClose: () => void
}

export function AbrirOSModal({ tecnicos, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const [tecnicoId, setTecnicoId] = useState('')
  const [clienteId, setClienteId] = useState('')
  const [clientes, setClientes] = useState<ClienteOpcao[]>([])
  const [loadingClientes, setLoadingClientes] = useState(false)

  const [equipamentos, setEquipamentos] = useState<EquipamentoOpcao[]>([])
  const [loadingEquips, setLoadingEquips] = useState(false)
  const [equipsSelecionados, setEquipsSelecionados] = useState<string[]>([])

  const [modalEquipAberto, setModalEquipAberto] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !modalEquipAberto) onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, modalEquipAberto])

  async function buscarClientes(tid: string) {
    setLoadingClientes(true)
    setClientes([])
    setClienteId('')
    setEquipamentos([])
    setEquipsSelecionados([])
    const res = await fetch(`/api/clientes?tecnico_id=${tid}`)
    const data = await res.json()
    setClientes(Array.isArray(data) ? data : [])
    setLoadingClientes(false)
  }

  const buscarEquipamentos = useCallback(async (cid: string) => {
    setLoadingEquips(true)
    setEquipamentos([])
    setEquipsSelecionados([])
    const res = await fetch(`/api/equipamentos?cliente_id=${cid}`)
    const data = await res.json()
    setEquipamentos(Array.isArray(data) ? data : [])
    setLoadingEquips(false)
  }, [])

  function toggleEquip(id: string) {
    setEquipsSelecionados((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  function labelEquip(e: EquipamentoOpcao) {
    const parts = [
      e.tipo.replace('_', '-').charAt(0).toUpperCase() + e.tipo.slice(1).replace('_', '-'),
      e.marca,
      e.btus ? `${e.btus} BTUs` : null,
      e.ambiente,
    ].filter(Boolean)
    return parts.join(' — ')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('equipamentos_ids', JSON.stringify(equipsSelecionados))

    const result = await abrirOS(formData)

    if (!result.success) {
      setErro(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    window.location.href = `/admin/os/${result.os_id}`
  }

  const tecnicosAtivos = tecnicos.filter((t) => ['piloto', 'ativo'].includes(t.status))

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100 }} />

      <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '20px', width: '100%', maxWidth: '560px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0', flexShrink: 0 }}>
            <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>Nova OS</h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--na2s-texto-secundario)', padding: '4px', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Seção: Identificação */}
              <div>
                <div style={SECTION_TITLE}>Identificação</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Field label="Técnico" required>
                    <select
                      name="tecnico_id"
                      required
                      value={tecnicoId}
                      onChange={(e) => {
                        setTecnicoId(e.target.value)
                        if (e.target.value) buscarClientes(e.target.value)
                      }}
                      style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      <option value="">Selecione o técnico...</option>
                      {tecnicosAtivos.map((t) => (
                        <option key={t.id} value={t.id}>{t.nome}</option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Cliente" required>
                    <select
                      name="cliente_id"
                      required
                      value={clienteId}
                      disabled={!tecnicoId || loadingClientes}
                      onChange={(e) => {
                        setClienteId(e.target.value)
                        if (e.target.value) buscarEquipamentos(e.target.value)
                      }}
                      style={{ ...INPUT_STYLE, cursor: tecnicoId ? 'pointer' : 'not-allowed', opacity: !tecnicoId ? 0.5 : 1 }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      <option value="">
                        {loadingClientes ? 'Carregando...' : !tecnicoId ? 'Selecione um técnico primeiro' : 'Selecione o cliente...'}
                      </option>
                      {clientes.map((c) => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Seção: Serviço */}
              <div>
                <div style={SECTION_TITLE}>Serviço</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Field label="Tipo de serviço" required>
                    <select name="tipo_servico" required style={{ ...INPUT_STYLE, cursor: 'pointer' }} onFocus={focusStyle} onBlur={blurStyle}>
                      <option value="">Selecione...</option>
                      <option value="instalacao">Instalação</option>
                      <option value="manutencao">Manutenção</option>
                      <option value="limpeza">Limpeza</option>
                      <option value="reparo">Reparo</option>
                      <option value="orcamento">Orçamento</option>
                      <option value="outros">Outros</option>
                    </select>
                  </Field>

                  <Field label="Descrição da solicitação">
                    <textarea
                      name="descricao_solicitacao"
                      rows={3}
                      placeholder="O que o cliente relatou? Qual o problema?"
                      style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: '80px' } as React.CSSProperties}
                      onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                      onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                    />
                  </Field>

                  <Field label="Data e hora agendada" required>
                    <input
                      name="data_agendamento"
                      type="datetime-local"
                      required
                      style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </Field>
                </div>
              </div>

              {/* Seção: Equipamentos */}
              {clienteId && (
                <div>
                  <div style={SECTION_TITLE}>Equipamentos (opcional)</div>
                  {loadingEquips ? (
                    <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '13px' }}>Carregando equipamentos...</p>
                  ) : equipamentos.length === 0 ? (
                    <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '13px', marginBottom: '8px' }}>
                      Nenhum equipamento cadastrado para este cliente.
                    </p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '8px' }}>
                      {equipamentos.map((eq) => (
                        <label
                          key={eq.id}
                          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px 12px', borderRadius: '10px', border: `1px solid ${equipsSelecionados.includes(eq.id) ? 'var(--na2s-lima)' : 'var(--na2s-borda)'}`, backgroundColor: equipsSelecionados.includes(eq.id) ? 'rgba(200,255,87,0.06)' : 'transparent', transition: 'all 0.15s' }}
                        >
                          <input
                            type="checkbox"
                            checked={equipsSelecionados.includes(eq.id)}
                            onChange={() => toggleEquip(eq.id)}
                            style={{ accentColor: 'var(--na2s-lima)', width: '16px', height: '16px' }}
                          />
                          <span style={{ fontSize: '13px', color: 'var(--na2s-papel)' }}>{labelEquip(eq)}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setModalEquipAberto(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--na2s-lima)', fontSize: '13px', fontFamily: 'inherit', padding: 0, fontWeight: 500 }}
                  >
                    <Plus size={14} />
                    Adicionar equipamento
                  </button>
                </div>
              )}

              {/* Seção: Observações */}
              <div>
                <div style={SECTION_TITLE}>Observações</div>
                <textarea
                  name="observacoes"
                  rows={2}
                  placeholder="Notas internas sobre esta OS..."
                  style={{ ...INPUT_STYLE, resize: 'vertical' } as React.CSSProperties}
                  onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                  onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                />
              </div>

              {erro && <p style={{ color: 'var(--na2s-ambar)', fontSize: '13px', margin: 0 }}>{erro}</p>}
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '16px 24px 24px', borderTop: '1px solid var(--na2s-borda)', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} disabled={loading} style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-papel)', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: '999px', border: 'none', backgroundColor: loading ? 'var(--na2s-texto-mudo)' : 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Abrindo OS...' : 'Abrir OS'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {modalEquipAberto && clienteId && tecnicoId && (
        <NovoEquipamentoModal
          cliente_id={clienteId}
          tecnico_id={tecnicoId}
          onClose={() => setModalEquipAberto(false)}
          onSuccess={() => buscarEquipamentos(clienteId)}
        />
      )}
    </>
  )
}
