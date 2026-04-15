'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { editarOS } from '@/app/actions/ordens-servico'
import type { OrdemServico, TipoEquipamento } from '@/types'

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

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-lima)'
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-borda)'
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={LABEL_STYLE}>{label}</label>
      {children}
    </div>
  )
}

const TIPO_EQUIP_LABEL: Record<TipoEquipamento, string> = {
  split: 'Split', cassete: 'Cassete', janela: 'Janela', multi_split: 'Multi-Split',
  pe_teto: 'Pé-Teto', comercial: 'Comercial', industrial: 'Industrial',
}

interface Props {
  os: OrdemServico
  onClose: () => void
}

export function EditarOSModal({ os, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Formatar data para datetime-local input
  const dataAgendamentoDefault = os.data_agendamento
    ? new Date(os.data_agendamento).toISOString().slice(0, 16)
    : ''

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('os_id', os.id)

    const result = await editarOS(formData)

    if (!result.success) {
      setErro(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    onClose()
    router.refresh()
  }

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 100 }} />
      <div style={{ position: 'fixed', inset: 0, zIndex: 101, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '20px', width: '100%', maxWidth: '480px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0', flexShrink: 0 }}>
            <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
              Editar OS #{String(os.numero_os).padStart(4, '0')}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--na2s-texto-secundario)', padding: '4px', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Campos não editáveis */}
              <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(90,96,112,0.08)', border: '1px solid var(--na2s-borda)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
                  Dados fixos
                </div>
                <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
                  Cliente: <span style={{ color: 'var(--na2s-papel)' }}>{os.cliente?.nome ?? '—'}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
                  Técnico: <span style={{ color: 'var(--na2s-papel)' }}>{os.tecnico?.nome ?? '—'}</span>
                </div>
                {os.equipamentos && os.equipamentos.length > 0 && (
                  <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
                    Equipamentos: <span style={{ color: 'var(--na2s-papel)' }}>
                      {os.equipamentos.map((eq) => TIPO_EQUIP_LABEL[eq.tipo] ?? eq.tipo).join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <Field label="Status">
                <select
                  name="status"
                  defaultValue={os.status}
                  style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                >
                  <option value="agendada">Agendada</option>
                  <option value="em_andamento">Em andamento</option>
                </select>
              </Field>

              <Field label="Tipo de serviço">
                <select
                  name="tipo_servico"
                  defaultValue={os.tipo_servico ?? ''}
                  style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                >
                  <option value="">— Selecione —</option>
                  <option value="instalacao">Instalação</option>
                  <option value="manutencao">Manutenção</option>
                  <option value="limpeza">Limpeza</option>
                  <option value="reparo">Reparo</option>
                  <option value="orcamento">Orçamento</option>
                  <option value="outros">Outros</option>
                </select>
              </Field>

              <Field label="Data e hora agendada">
                <input
                  name="data_agendamento"
                  type="datetime-local"
                  defaultValue={dataAgendamentoDefault}
                  style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>

              <Field label="Descrição da solicitação">
                <textarea
                  name="descricao_solicitacao"
                  rows={3}
                  defaultValue={os.descricao_solicitacao ?? ''}
                  style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: '80px' } as React.CSSProperties}
                  onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                  onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                />
              </Field>

              <Field label="Observações">
                <textarea
                  name="observacoes"
                  rows={2}
                  defaultValue={os.observacoes ?? ''}
                  style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: '60px' } as React.CSSProperties}
                  onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                  onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                />
              </Field>

              {erro && <p style={{ color: 'var(--na2s-ambar)', fontSize: '13px', margin: 0 }}>{erro}</p>}
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '16px 24px 24px', borderTop: '1px solid var(--na2s-borda)', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} disabled={loading} style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-papel)', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: '999px', border: 'none', backgroundColor: loading ? 'var(--na2s-texto-mudo)' : 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
