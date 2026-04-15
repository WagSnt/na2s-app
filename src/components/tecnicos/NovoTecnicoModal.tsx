'use client'

import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import { criarTecnico } from '@/app/actions/tecnicos'

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

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
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

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-lima)'
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-borda)'
}

// Toast simples
function Toast({ mensagem, onClose }: { mensagem: string; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        backgroundColor: 'var(--na2s-ardosia)',
        border: '1px solid var(--na2s-lima)',
        borderRadius: '12px',
        padding: '14px 20px',
        color: 'var(--na2s-papel)',
        fontSize: '14px',
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        maxWidth: '320px',
      }}
    >
      {mensagem}
    </div>
  )
}

export function NovoTecnicoModal({ onClose }: { onClose: () => void }) {
  const [ehPiloto, setEhPiloto] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  // Fechar com Escape
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
    formData.set('eh_piloto', ehPiloto ? 'true' : 'false')

    const result = await criarTecnico(formData)

    if (!result.success) {
      setErro(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setToast('Técnico cadastrado com sucesso!')
    onClose()
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(4px)',
          zIndex: 100,
        }}
      />

      {/* Container */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 101,
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
            maxWidth: '560px',
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '24px 24px 0',
              flexShrink: 0,
            }}
          >
            <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
              Novo técnico parceiro
            </h2>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--na2s-texto-secundario)',
                padding: '4px',
                display: 'flex',
                lineHeight: 1,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Formulário com scroll */}
          <form ref={formRef} onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Seção: Dados pessoais */}
              <div>
                <div style={SECTION_TITLE}>Dados pessoais</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Field label="Nome completo" required>
                    <input
                      name="nome"
                      type="text"
                      required
                      style={INPUT_STYLE}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </Field>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="WhatsApp pessoal" required>
                      <input
                        name="whatsapp_pessoal"
                        type="text"
                        required
                        placeholder="(51) 99999-9999"
                        style={INPUT_STYLE}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                    <Field label="WhatsApp do negócio">
                      <input
                        name="whatsapp_negocio"
                        type="text"
                        placeholder="(51) 99999-9999"
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
                        style={INPUT_STYLE}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                    <Field label="Instagram">
                      <input
                        name="instagram"
                        type="text"
                        placeholder="@usuario"
                        style={INPUT_STYLE}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Seção: Contrato */}
              <div>
                <div style={SECTION_TITLE}>Contrato</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <Field label="Pacote" required>
                    <select
                      name="pacote"
                      required
                      style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      <option value="">Selecione...</option>
                      <option value="starter">Starter — R$ 997/mês + 5%</option>
                      <option value="pro">Pro — R$ 1.497/mês + 8%</option>
                      <option value="full">Full — R$ 2.497/mês + 8%</option>
                    </select>
                  </Field>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="Data de início" required>
                      <input
                        name="data_inicio"
                        type="date"
                        required
                        style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                    <Field label="Dia de cobrança" required>
                      <input
                        name="dia_cobranca"
                        type="number"
                        required
                        min={1}
                        max={28}
                        defaultValue={5}
                        style={INPUT_STYLE}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                  </div>

                  <Field label="Origem">
                    <select
                      name="origem"
                      style={{ ...INPUT_STYLE, cursor: 'pointer' }}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      <option value="">Selecione...</option>
                      <option value="indicacao">Indicação</option>
                      <option value="instagram">Instagram</option>
                      <option value="grupo_whatsapp">Grupo WhatsApp</option>
                      <option value="landing_page">Landing Page</option>
                      <option value="abordagem_direta">Abordagem Direta</option>
                    </select>
                  </Field>

                  {/* Toggle piloto */}
                  <div>
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        cursor: 'pointer',
                        userSelect: 'none',
                      }}
                    >
                      <div
                        onClick={() => setEhPiloto(!ehPiloto)}
                        style={{
                          width: '40px',
                          height: '22px',
                          borderRadius: '999px',
                          backgroundColor: ehPiloto ? 'var(--na2s-lima)' : 'var(--na2s-borda)',
                          position: 'relative',
                          transition: 'background-color 0.2s',
                          flexShrink: 0,
                          cursor: 'pointer',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            top: '3px',
                            left: ehPiloto ? '21px' : '3px',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            backgroundColor: ehPiloto ? 'var(--na2s-noite)' : 'var(--na2s-texto-secundario)',
                            transition: 'left 0.2s',
                          }}
                        />
                      </div>
                      <span style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>
                        É técnico piloto?
                      </span>
                    </label>

                    {ehPiloto && (
                      <div
                        style={{
                          marginTop: '10px',
                          backgroundColor: 'rgba(200,255,87,0.06)',
                          border: '1px solid rgba(200,255,87,0.15)',
                          borderRadius: '10px',
                          padding: '12px',
                          color: 'var(--na2s-lima)',
                          fontSize: '12px',
                          lineHeight: 1.6,
                        }}
                      >
                        Mês 1: R$ 497 sem comissão&nbsp;•&nbsp;
                        Mês 2: R$ 497 + 4%&nbsp;•&nbsp;
                        Mês 3+: preço cheio do pacote
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção: Observações */}
              <div>
                <div style={SECTION_TITLE}>Observações</div>
                <textarea
                  name="observacoes"
                  rows={3}
                  placeholder="Notas internas sobre o técnico..."
                  style={{
                    ...INPUT_STYLE,
                    resize: 'vertical',
                    minHeight: '80px',
                  } as React.CSSProperties}
                  onFocus={focusStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                  onBlur={blurStyle as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
                />
              </div>

              {/* Erro */}
              {erro && (
                <p style={{ color: 'var(--na2s-ambar)', fontSize: '13px', margin: 0 }}>
                  {erro}
                </p>
              )}
            </div>

            {/* Rodapé do modal */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                padding: '16px 24px 24px',
                borderTop: '1px solid var(--na2s-borda)',
                flexShrink: 0,
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  borderRadius: '999px',
                  border: '1px solid var(--na2s-borda)',
                  backgroundColor: 'transparent',
                  color: 'var(--na2s-papel)',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 24px',
                  borderRadius: '999px',
                  border: 'none',
                  backgroundColor: loading ? 'var(--na2s-texto-mudo)' : 'var(--na2s-lima)',
                  color: 'var(--na2s-noite)',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  transition: 'background-color 0.15s',
                }}
              >
                {loading ? 'Cadastrando...' : 'Cadastrar técnico'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast mensagem={toast} onClose={() => setToast('')} />}
    </>
  )
}
