'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { editarTecnico } from '@/app/actions/tecnicos'
import type { Tecnico, Pacote } from '@/types'

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

const PACOTE_LABEL: Record<Pacote, string> = { starter: 'Starter', pro: 'Pro', full: 'Full' }

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })
}

interface Props {
  tecnico: Tecnico
  onClose: () => void
}

export function EditarTecnicoModal({ tecnico, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('id', tecnico.id)

    const result = await editarTecnico(formData)

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
              Editar técnico
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--na2s-texto-secundario)', padding: '4px', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Campos não editáveis */}
              <div style={{ padding: '12px 14px', borderRadius: '10px', backgroundColor: 'rgba(90,96,112,0.08)', border: '1px solid var(--na2s-borda)', display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Pacote</div>
                  <div style={{ fontSize: '14px', color: 'var(--na2s-papel)', fontWeight: 600 }}>{PACOTE_LABEL[tecnico.pacote]}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>Início</div>
                  <div style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>{formatDate(tecnico.data_inicio)}</div>
                </div>
              </div>

              <Field label="Nome completo">
                <input
                  name="nome"
                  type="text"
                  required
                  defaultValue={tecnico.nome}
                  style={INPUT_STYLE}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="WhatsApp pessoal">
                  <input
                    name="whatsapp_pessoal"
                    type="text"
                    required
                    defaultValue={tecnico.whatsapp_pessoal}
                    style={INPUT_STYLE}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>
                <Field label="WhatsApp negócio">
                  <input
                    name="whatsapp_negocio"
                    type="text"
                    defaultValue={tecnico.whatsapp_negocio ?? ''}
                    style={INPUT_STYLE}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="E-mail">
                  <input
                    name="email"
                    type="email"
                    defaultValue={tecnico.email ?? ''}
                    style={INPUT_STYLE}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>
                <Field label="Instagram">
                  <input
                    name="instagram"
                    type="text"
                    defaultValue={tecnico.instagram ?? ''}
                    style={INPUT_STYLE}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Status">
                  <select
                    name="status"
                    defaultValue={tecnico.status}
                    style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  >
                    <option value="piloto">Piloto</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                    <option value="inadimplente">Inadimplente</option>
                    <option value="cancelado">Cancelado</option>
                  </select>
                </Field>
                <Field label="Dia de cobrança">
                  <input
                    name="dia_cobranca"
                    type="number"
                    min={1}
                    max={28}
                    required
                    defaultValue={tecnico.dia_cobranca}
                    style={INPUT_STYLE}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>
              </div>

              <Field label="Observações">
                <textarea
                  name="observacoes"
                  rows={3}
                  defaultValue={tecnico.observacoes ?? ''}
                  style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: '72px' } as React.CSSProperties}
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
