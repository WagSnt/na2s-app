'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Loader2 } from 'lucide-react'
import { gerarRepasse } from '@/app/actions/financeiro'
import type { Tecnico } from '@/types'

interface OsDetalhe {
  numero_os: number
  cliente: string
  valor: number
  comissao: number
}

interface Preview {
  valor_comissao: number
  num_os: number
  os_detalhes: OsDetalhe[]
}

interface Props {
  tecnicos: Pick<Tecnico, 'id' | 'nome' | 'status'>[]
  onClose: () => void
}

function hoje(): string {
  return new Date().toISOString().split('T')[0]
}

function formatCurrency(val: number) {
  return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function GerarRepasseModal({ tecnicos, onClose }: Props) {
  const tecnicosAtivos = tecnicos.filter((t) => t.status === 'ativo' || t.status === 'piloto')

  const [tecnicoId, setTecnicoId] = useState(tecnicosAtivos[0]?.id ?? '')
  const [inicio, setInicio] = useState(() => {
    const d = new Date()
    d.setDate(1)
    return d.toISOString().split('T')[0]
  })
  const [fim, setFim] = useState(hoje)
  const [preview, setPreview] = useState<Preview | null>(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const buscarPreview = useCallback(async () => {
    if (!tecnicoId || !inicio || !fim) return
    setLoadingPreview(true)
    setPreview(null)
    try {
      const res = await fetch(
        `/api/repasse-preview?tecnico_id=${tecnicoId}&inicio=${inicio}&fim=${fim}`
      )
      const data = await res.json()
      if (res.ok) setPreview(data)
    } finally {
      setLoadingPreview(false)
    }
  }, [tecnicoId, inicio, fim])

  useEffect(() => {
    const timeout = setTimeout(buscarPreview, 400)
    return () => clearTimeout(timeout)
  }, [buscarPreview])

  async function handleGerar() {
    setSalvando(true)
    setErro(null)
    const res = await gerarRepasse(tecnicoId, inicio, fim)
    setSalvando(false)
    if (res.success) {
      setSucesso(true)
    } else {
      setErro(res.error)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid var(--na2s-borda)', backgroundColor: 'var(--na2s-noite)',
    color: 'var(--na2s-papel)', fontSize: '14px', fontFamily: 'inherit',
    boxSizing: 'border-box',
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        backgroundColor: 'rgba(10,12,15,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !salvando) onClose() }}
    >
      <div
        style={{
          backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)',
          borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '460px',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Gerar repasse
          </h2>
          {!salvando && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--na2s-texto-secundario)', cursor: 'pointer', padding: '4px' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {sucesso ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>✓</div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--na2s-lima)', marginBottom: '8px' }}>Repasse gerado!</div>
            <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '24px' }}>
              {preview && formatCurrency(preview.valor_comissao)} · {preview?.num_os} OS
            </div>
            <button
              onClick={onClose}
              style={{ padding: '12px 32px', borderRadius: '999px', border: 'none', backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            {/* Técnico */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '8px' }}>
                Técnico
              </label>
              <select
                value={tecnicoId}
                onChange={(e) => setTecnicoId(e.target.value)}
                style={{ ...inputStyle, appearance: 'none' }}
              >
                {tecnicosAtivos.map((t) => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>

            {/* Período */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '8px' }}>
                  Início do período
                </label>
                <input type="date" value={inicio} onChange={(e) => setInicio(e.target.value)} style={inputStyle} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '8px' }}>
                  Fim do período
                </label>
                <input type="date" value={fim} onChange={(e) => setFim(e.target.value)} style={inputStyle} />
              </div>
            </div>

            {/* Preview */}
            <div
              style={{
                padding: '14px 16px', borderRadius: '10px', marginBottom: '20px',
                backgroundColor: 'rgba(200,255,87,0.04)', border: '1px solid rgba(200,255,87,0.12)',
              }}
            >
              {loadingPreview ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--na2s-texto-secundario)', fontSize: '13px' }}>
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                  Calculando preview...
                </div>
              ) : preview ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>Comissão do período</span>
                    <span style={{ fontSize: '20px', fontWeight: 700, color: 'var(--na2s-lima)', letterSpacing: '-0.5px' }}>
                      {formatCurrency(preview.valor_comissao)}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)' }}>
                    {preview.num_os} OS concluída{preview.num_os !== 1 ? 's' : ''} no período
                  </div>
                  {preview.os_detalhes.length > 0 && (
                    <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {preview.os_detalhes.map((os) => (
                        <div key={os.numero_os} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                          <span style={{ color: 'var(--na2s-texto-secundario)' }}>
                            OS #{String(os.numero_os).padStart(4, '0')} — {os.cliente}
                          </span>
                          <span style={{ color: 'var(--na2s-papel)' }}>{formatCurrency(os.comissao)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ fontSize: '13px', color: 'var(--na2s-texto-mudo)' }}>
                  Selecione técnico e período para ver o preview.
                </div>
              )}
            </div>

            {erro && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: 'rgba(255,68,68,0.08)', border: '1px solid rgba(255,68,68,0.2)', marginBottom: '16px', fontSize: '13px', color: '#FF4444' }}>
                {erro}
              </div>
            )}

            <button
              onClick={handleGerar}
              disabled={salvando || !tecnicoId}
              style={{
                width: '100%', padding: '12px', borderRadius: '999px', border: 'none',
                backgroundColor: salvando || !tecnicoId ? 'var(--na2s-borda)' : 'var(--na2s-lima)',
                color: salvando || !tecnicoId ? 'var(--na2s-texto-mudo)' : 'var(--na2s-noite)',
                fontWeight: 700, fontSize: '14px',
                cursor: salvando || !tecnicoId ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              }}
            >
              {salvando && <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />}
              {salvando ? 'Gerando...' : 'Gerar repasse'}
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
