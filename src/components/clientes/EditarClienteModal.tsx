'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { editarCliente } from '@/app/actions/clientes'
import type { Cliente } from '@/types'

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

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-lima)'
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
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

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--na2s-texto-terciario)', textTransform: 'uppercase', letterSpacing: '0.08em', paddingTop: '4px', borderTop: '1px solid var(--na2s-borda)', marginTop: '4px' }}>
      {children}
    </div>
  )
}

interface Props {
  cliente: Cliente
  onClose: () => void
}

export function EditarClienteModal({ cliente, onClose }: Props) {
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
    formData.set('id', cliente.id)
    formData.set('tecnico_id', cliente.tecnico_id)

    const result = await editarCliente(formData)

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
          style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '20px', width: '100%', maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0', flexShrink: 0 }}>
            <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
              Editar cliente
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--na2s-texto-secundario)', padding: '4px', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>

              <Field label="Nome completo">
                <input
                  name="nome"
                  type="text"
                  required
                  defaultValue={cliente.nome}
                  style={INPUT_STYLE}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="WhatsApp">
                  <input name="whatsapp" type="text" defaultValue={cliente.whatsapp ?? ''} style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="E-mail">
                  <input name="email" type="email" defaultValue={cliente.email ?? ''} style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="CPF">
                  <input name="cpf" type="text" defaultValue={cliente.cpf ?? ''} style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="Data de nascimento">
                  <input name="data_nascimento" type="date" defaultValue={cliente.data_nascimento ?? ''} style={{ ...INPUT_STYLE, colorScheme: 'dark' }} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </div>

              <SectionTitle>Endereço</SectionTitle>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px' }}>
                <Field label="Rua">
                  <input name="endereco_rua" type="text" defaultValue={cliente.endereco_rua ?? ''} style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="Número">
                  <input name="endereco_numero" type="text" defaultValue={cliente.endereco_numero ?? ''} style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Bairro">
                  <input name="endereco_bairro" type="text" defaultValue={cliente.endereco_bairro ?? ''} style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="Cidade">
                  <input name="endereco_cidade" type="text" defaultValue={cliente.endereco_cidade ?? ''} style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </div>

              <Field label="CEP">
                <input name="endereco_cep" type="text" defaultValue={cliente.endereco_cep ?? ''} style={{ ...INPUT_STYLE, maxWidth: '200px' }} onFocus={focusStyle} onBlur={blurStyle} />
              </Field>

              <SectionTitle>Observações</SectionTitle>

              <textarea
                name="observacoes"
                rows={3}
                defaultValue={cliente.observacoes ?? ''}
                placeholder="Observações sobre o cliente..."
                style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: '72px' } as React.CSSProperties}
                onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
              />

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
