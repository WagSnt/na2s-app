'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { fecharOS } from '@/app/actions/ordens-servico'

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

interface Props {
  os_id: string
  os_numero: number
  onClose: () => void
}

export function FecharOSModal({ os_id, os_numero, onClose }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [statusPagamento, setStatusPagamento] = useState('')

  const hoje = new Date().toISOString().split('T')[0]

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('os_id', os_id)

    const result = await fecharOS(formData)

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
              Registrar conclusão — OS #{String(os_numero).padStart(4, '0')}
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--na2s-texto-secundario)', padding: '4px', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              <Field label="O que foi feito" required>
                <textarea
                  name="o_que_foi_feito"
                  required
                  rows={4}
                  placeholder="Descreva o serviço executado..."
                  style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: '100px' } as React.CSSProperties}
                  onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                  onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                />
              </Field>

              <Field label="Valor cobrado" required>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--na2s-texto-secundario)', fontSize: '14px', pointerEvents: 'none' }}>
                    R$
                  </span>
                  <input
                    name="valor_cobrado"
                    type="number"
                    required
                    min={0}
                    step={0.01}
                    style={{ ...INPUT_STYLE, paddingLeft: '40px' }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </Field>

              <Field label="Forma de pagamento" required>
                <select name="forma_pagamento" required style={{ ...INPUT_STYLE, cursor: 'pointer' }} onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="">Selecione...</option>
                  <option value="pix">PIX</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="cartao_credito">Cartão de Crédito</option>
                  <option value="cartao_debito">Cartão de Débito</option>
                  <option value="transferencia">Transferência</option>
                  <option value="boleto">Boleto</option>
                </select>
              </Field>

              <Field label="Status do pagamento" required>
                <select
                  name="status_pagamento"
                  required
                  value={statusPagamento}
                  onChange={(e) => setStatusPagamento(e.target.value)}
                  style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                >
                  <option value="">Selecione...</option>
                  <option value="pago">Pago</option>
                  <option value="pendente">Pendente</option>
                  <option value="inadimplente">Inadimplente</option>
                </select>
              </Field>

              {statusPagamento === 'pago' && (
                <Field label="Data do pagamento" required>
                  <input
                    name="data_pagamento"
                    type="date"
                    required
                    defaultValue={hoje}
                    style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>
              )}

              <Field label="Data de conclusão" required>
                <input
                  name="data_conclusao"
                  type="date"
                  required
                  defaultValue={hoje}
                  style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                />
              </Field>

              {erro && <p style={{ color: 'var(--na2s-ambar)', fontSize: '13px', margin: 0 }}>{erro}</p>}
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '16px 24px 24px', borderTop: '1px solid var(--na2s-borda)', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} disabled={loading} style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-papel)', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: '999px', border: 'none', backgroundColor: loading ? 'var(--na2s-texto-mudo)' : 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Salvando...' : 'Registrar conclusão'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
