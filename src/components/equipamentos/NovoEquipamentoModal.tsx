'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { criarEquipamento } from '@/app/actions/equipamentos'

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

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-lima)'
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) {
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
  cliente_id: string
  tecnico_id: string
  onSuccess: () => void
  onClose: () => void
}

export function NovoEquipamentoModal({ cliente_id, tecnico_id, onSuccess, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [periodicidade, setPeriodicidade] = useState('6')
  const [personalizado, setPersonalizado] = useState(false)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handlePeriodicidadeChange(val: string) {
    if (val === 'personalizado') {
      setPersonalizado(true)
      setPeriodicidade('')
    } else {
      setPersonalizado(false)
      setPeriodicidade(val)
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set('cliente_id', cliente_id)
    formData.set('tecnico_id', tecnico_id)
    if (!personalizado) formData.set('periodicidade_meses', periodicidade)

    const result = await criarEquipamento(formData)

    if (!result.success) {
      setErro(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    onSuccess()
    onClose()
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 200 }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 201,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            backgroundColor: 'var(--na2s-ardosia)',
            border: '1px solid var(--na2s-borda)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '480px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 24px 0', flexShrink: 0 }}>
            <h2 style={{ color: 'var(--na2s-papel)', fontSize: '18px', fontWeight: 700, margin: 0 }}>
              Novo equipamento
            </h2>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--na2s-texto-secundario)', padding: '4px', display: 'flex' }}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Field label="Tipo" required>
                <select name="tipo" required style={{ ...INPUT_STYLE, cursor: 'pointer' }} onFocus={focusStyle} onBlur={blurStyle}>
                  <option value="">Selecione...</option>
                  <option value="split">Split</option>
                  <option value="cassete">Cassete</option>
                  <option value="janela">Janela</option>
                  <option value="multi_split">Multi-Split</option>
                  <option value="pe_teto">Pé-Teto</option>
                  <option value="comercial">Comercial</option>
                  <option value="industrial">Industrial</option>
                </select>
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Field label="Marca">
                  <input name="marca" type="text" style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
                <Field label="BTUs">
                  <input name="btus" type="number" min={1} style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
                </Field>
              </div>

              <Field label="Ambiente">
                <input name="ambiente" type="text" placeholder="Sala, quarto, escritório..." style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
              </Field>

              <Field label="Última manutenção">
                <input name="ultima_manutencao" type="date" style={{ ...INPUT_STYLE, colorScheme: 'dark' }} onFocus={focusStyle} onBlur={blurStyle} />
              </Field>

              <Field label="Periodicidade de manutenção">
                <select
                  value={personalizado ? 'personalizado' : periodicidade}
                  onChange={(e) => handlePeriodicidadeChange(e.target.value)}
                  style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                  onFocus={focusStyle}
                  onBlur={blurStyle}
                >
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="personalizado">Personalizado</option>
                </select>
              </Field>

              {personalizado && (
                <Field label="Meses (personalizado)">
                  <input
                    name="periodicidade_meses"
                    type="number"
                    min={1}
                    max={60}
                    value={periodicidade}
                    onChange={(e) => setPeriodicidade(e.target.value)}
                    style={INPUT_STYLE}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </Field>
              )}
              {!personalizado && <input type="hidden" name="periodicidade_meses" value={periodicidade} />}

              <Field label="Observações">
                <input name="observacoes" type="text" style={INPUT_STYLE} onFocus={focusStyle} onBlur={blurStyle} />
              </Field>

              {erro && <p style={{ color: 'var(--na2s-ambar)', fontSize: '13px', margin: 0 }}>{erro}</p>}
            </div>

            <div style={{ display: 'flex', gap: '10px', padding: '16px 24px 24px', borderTop: '1px solid var(--na2s-borda)', justifyContent: 'flex-end' }}>
              <button type="button" onClick={onClose} disabled={loading} style={{ padding: '10px 20px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-papel)', fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancelar
              </button>
              <button type="submit" disabled={loading} style={{ padding: '10px 24px', borderRadius: '999px', border: 'none', backgroundColor: loading ? 'var(--na2s-texto-mudo)' : 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontSize: '14px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                {loading ? 'Salvando...' : 'Salvar equipamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
