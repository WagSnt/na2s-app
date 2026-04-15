'use client'

import { useState, useEffect } from 'react'
import { X, ChevronRight, ChevronDown } from 'lucide-react'
import { criarCliente } from '@/app/actions/clientes'

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

function focusStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-lima)'
}
function blurStyle(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
  e.currentTarget.style.borderColor = 'var(--na2s-borda)'
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

interface Props {
  tecnico_id: string
  onClose: () => void
}

export function NovoClienteModal({ tecnico_id, onClose }: Props) {
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [toast, setToast] = useState('')
  const [enderecoAberto, setEnderecoAberto] = useState(false)

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
    formData.set('tecnico_id', tecnico_id)

    const result = await criarCliente(formData)

    if (!result.success) {
      setErro(result.error)
      setLoading(false)
      return
    }

    setLoading(false)
    setToast('Cliente cadastrado com sucesso!')
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
              Novo cliente
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

          {/* Formulário */}
          <form onSubmit={handleSubmit} style={{ overflowY: 'auto', flex: 1 }}>
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* Seção: Dados do cliente */}
              <div>
                <div style={SECTION_TITLE}>Dados do cliente</div>
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
                    <Field label="WhatsApp">
                      <input
                        name="whatsapp"
                        type="text"
                        placeholder="(51) 99999-9999"
                        style={INPUT_STYLE}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                    <Field label="E-mail">
                      <input
                        name="email"
                        type="email"
                        style={INPUT_STYLE}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <Field label="CPF">
                      <input
                        name="cpf"
                        type="text"
                        placeholder="000.000.000-00"
                        style={INPUT_STYLE}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                    <Field label="Data de nascimento">
                      <input
                        name="data_nascimento"
                        type="date"
                        style={{ ...INPUT_STYLE, colorScheme: 'dark' }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Seção: Endereço (colapsável) */}
              <div>
                <button
                  type="button"
                  onClick={() => setEnderecoAberto(!enderecoAberto)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--na2s-texto-secundario)',
                    fontSize: '13px',
                    fontWeight: 600,
                    fontFamily: 'inherit',
                    padding: 0,
                    marginBottom: enderecoAberto ? '12px' : '0',
                    letterSpacing: '0.02em',
                  }}
                >
                  {enderecoAberto ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  Adicionar endereço
                </button>

                {enderecoAberto && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '12px', alignItems: 'end' }}>
                      <Field label="Rua">
                        <input
                          name="endereco_rua"
                          type="text"
                          style={INPUT_STYLE}
                          onFocus={focusStyle}
                          onBlur={blurStyle}
                        />
                      </Field>
                      <Field label="Número">
                        <input
                          name="endereco_numero"
                          type="text"
                          style={{ ...INPUT_STYLE, width: '80px' }}
                          onFocus={focusStyle}
                          onBlur={blurStyle}
                        />
                      </Field>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <Field label="Bairro">
                        <input
                          name="endereco_bairro"
                          type="text"
                          style={INPUT_STYLE}
                          onFocus={focusStyle}
                          onBlur={blurStyle}
                        />
                      </Field>
                      <Field label="Cidade">
                        <input
                          name="endereco_cidade"
                          type="text"
                          style={INPUT_STYLE}
                          onFocus={focusStyle}
                          onBlur={blurStyle}
                        />
                      </Field>
                    </div>

                    <Field label="CEP">
                      <input
                        name="endereco_cep"
                        type="text"
                        placeholder="00000-000"
                        style={{ ...INPUT_STYLE, maxWidth: '160px' }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* Seção: Observações */}
              <div>
                <div style={SECTION_TITLE}>Observações</div>
                <textarea
                  name="observacoes"
                  rows={3}
                  placeholder="Anotações sobre o cliente, histórico de ocorrências..."
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

            {/* Rodapé */}
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
                {loading ? 'Cadastrando...' : 'Cadastrar cliente'}
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
