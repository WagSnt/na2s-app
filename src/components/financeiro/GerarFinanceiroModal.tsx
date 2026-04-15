'use client'

import { useState } from 'react'
import { X, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { gerarFinanceiroMensal } from '@/app/actions/financeiro'
import type { Tecnico } from '@/types'

interface Props {
  tecnicos: Pick<Tecnico, 'id' | 'nome' | 'status'>[]
  mesInicial?: string
  onClose: () => void
}

function mesAtual(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

type ResultadoItem = { tecnico_id: string; nome: string; sucesso: boolean; erro?: string }

export function GerarFinanceiroModal({ tecnicos, mesInicial, onClose }: Props) {
  const tecnicosAtivos = tecnicos.filter((t) => t.status === 'ativo' || t.status === 'piloto')

  const [mes, setMes] = useState(mesInicial ?? mesAtual())
  const [selecionados, setSelecionados] = useState<Set<string>>(
    new Set(tecnicosAtivos.map((t) => t.id))
  )
  const [gerando, setGerando] = useState(false)
  const [progresso, setProgresso] = useState<{ atual: string; index: number; total: number } | null>(null)
  const [resultados, setResultados] = useState<ResultadoItem[] | null>(null)

  function toggleTecnico(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleTodos() {
    if (selecionados.size === tecnicosAtivos.length) {
      setSelecionados(new Set())
    } else {
      setSelecionados(new Set(tecnicosAtivos.map((t) => t.id)))
    }
  }

  async function handleGerar() {
    const lista = tecnicosAtivos.filter((t) => selecionados.has(t.id))
    if (lista.length === 0) return

    setGerando(true)
    setResultados(null)
    const resultadosFinal: ResultadoItem[] = []

    for (let i = 0; i < lista.length; i++) {
      const t = lista[i]
      setProgresso({ atual: t.nome, index: i + 1, total: lista.length })
      const res = await gerarFinanceiroMensal(t.id, mes)
      resultadosFinal.push({
        tecnico_id: t.id,
        nome: t.nome,
        sucesso: res.success,
        erro: res.success ? undefined : res.error,
      })
    }

    setProgresso(null)
    setGerando(false)
    setResultados(resultadosFinal)
  }

  const todosSelecionados = selecionados.size === tecnicosAtivos.length
  const algumSelecionado = selecionados.size > 0

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        backgroundColor: 'rgba(10,12,15,0.85)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px',
      }}
      onClick={(e) => { if (e.target === e.currentTarget && !gerando) onClose() }}
    >
      <div
        style={{
          backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)',
          borderRadius: '16px', padding: '24px', width: '100%', maxWidth: '480px',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ color: 'var(--na2s-papel)', fontSize: '20px', fontWeight: 700, margin: 0 }}>
            Gerar financeiro do mês
          </h2>
          {!gerando && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--na2s-texto-secundario)', cursor: 'pointer', padding: '4px' }}>
              <X size={20} />
            </button>
          )}
        </div>

        {/* Resultados */}
        {resultados ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '14px', margin: '0 0 12px' }}>
              Geração concluída para {mes}.
            </p>
            {resultados.map((r) => (
              <div
                key={r.tecnico_id}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '12px 14px', borderRadius: '10px',
                  backgroundColor: r.sucesso ? 'rgba(200,255,87,0.06)' : 'rgba(255,68,68,0.06)',
                  border: `1px solid ${r.sucesso ? 'rgba(200,255,87,0.15)' : 'rgba(255,68,68,0.2)'}`,
                }}
              >
                {r.sucesso
                  ? <CheckCircle size={16} color="var(--na2s-lima)" />
                  : <XCircle size={16} color="#FF4444" />
                }
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--na2s-papel)' }}>{r.nome}</div>
                  {r.erro && <div style={{ fontSize: '12px', color: '#FF4444', marginTop: '2px' }}>{r.erro}</div>}
                </div>
              </div>
            ))}
            <button
              onClick={onClose}
              style={{ marginTop: '16px', padding: '12px', borderRadius: '999px', border: 'none', backgroundColor: 'var(--na2s-lima)', color: 'var(--na2s-noite)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}
            >
              Fechar
            </button>
          </div>
        ) : gerando ? (
          /* Loading state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '32px 0' }}>
            <Loader2 size={32} color="var(--na2s-lima)" style={{ animation: 'spin 1s linear infinite' }} />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '15px', color: 'var(--na2s-papel)', fontWeight: 600 }}>
                Gerando para {progresso?.atual}...
              </div>
              <div style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginTop: '4px' }}>
                {progresso?.index} de {progresso?.total}
              </div>
            </div>
            <div style={{ width: '100%', backgroundColor: 'var(--na2s-borda)', borderRadius: '999px', height: '4px' }}>
              <div
                style={{
                  height: '4px', borderRadius: '999px', backgroundColor: 'var(--na2s-lima)',
                  width: `${((progresso?.index ?? 0) / (progresso?.total ?? 1)) * 100}%`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>
        ) : (
          /* Formulário */
          <>
            {/* Mês */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: 'var(--na2s-texto-secundario)', marginBottom: '8px' }}>
                Mês de referência
              </label>
              <input
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
                style={{
                  width: '100%', padding: '10px 12px', borderRadius: '8px',
                  border: '1px solid var(--na2s-borda)', backgroundColor: 'var(--na2s-noite)',
                  color: 'var(--na2s-papel)', fontSize: '14px', fontFamily: 'inherit',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Lista de técnicos */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
                  Técnicos ({selecionados.size} selecionados)
                </label>
                <button
                  type="button"
                  onClick={toggleTodos}
                  style={{ fontSize: '12px', color: 'var(--na2s-lima)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
                >
                  {todosSelecionados ? 'Desmarcar todos' : 'Selecionar todos'}
                </button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '240px', overflowY: 'auto' }}>
                {tecnicosAtivos.map((t) => (
                  <label
                    key={t.id}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                      backgroundColor: selecionados.has(t.id) ? 'rgba(200,255,87,0.06)' : 'transparent',
                      border: `1px solid ${selecionados.has(t.id) ? 'rgba(200,255,87,0.2)' : 'var(--na2s-borda)'}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selecionados.has(t.id)}
                      onChange={() => toggleTecnico(t.id)}
                      style={{ accentColor: 'var(--na2s-lima)', width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '14px', color: 'var(--na2s-papel)' }}>{t.nome}</span>
                  </label>
                ))}
                {tecnicosAtivos.length === 0 && (
                  <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '13px', margin: 0, textAlign: 'center', padding: '16px 0' }}>
                    Nenhum técnico ativo.
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleGerar}
              disabled={!algumSelecionado}
              style={{
                width: '100%', padding: '12px', borderRadius: '999px', border: 'none',
                backgroundColor: algumSelecionado ? 'var(--na2s-lima)' : 'var(--na2s-borda)',
                color: algumSelecionado ? 'var(--na2s-noite)' : 'var(--na2s-texto-mudo)',
                fontWeight: 700, fontSize: '14px', cursor: algumSelecionado ? 'pointer' : 'not-allowed',
                fontFamily: 'inherit',
              }}
            >
              Gerar para {selecionados.size} técnico{selecionados.size !== 1 ? 's' : ''}
            </button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
