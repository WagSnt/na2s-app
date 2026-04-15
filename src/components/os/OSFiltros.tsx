'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import type { Tecnico } from '@/types'

const INPUT_STYLE: React.CSSProperties = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--na2s-borda)',
  backgroundColor: 'var(--na2s-ardosia)',
  color: 'var(--na2s-papel)',
  fontSize: '13px',
  fontFamily: 'inherit',
  outline: 'none',
  colorScheme: 'dark',
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todas' },
  { value: 'agendada', label: 'Agendada' },
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'cancelada', label: 'Cancelada' },
]

interface Props {
  tecnicos: Pick<Tecnico, 'id' | 'nome'>[]
}

export function OSFiltros({ tecnicos }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const statusAtual = searchParams.get('status') ?? ''
  const tecnicoAtual = searchParams.get('tecnico_id') ?? ''
  const dataInicio = searchParams.get('data_inicio') ?? ''
  const dataFim = searchParams.get('data_fim') ?? ''

  const temFiltroAtivo = !!statusAtual || !!tecnicoAtual || !!dataInicio || !!dataFim

  function handleStatus(value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('status', value)
    else params.delete('status')
    router.push(`${pathname}?${params.toString()}`)
  }

  function handleChange(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`)
  }

  function limparFiltros() {
    router.push(pathname)
  }

  return (
    <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'flex-end' }}>

      {/* Status */}
      <div>
        <div style={{ fontSize: '11px', color: 'var(--na2s-texto-terciario)', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Status
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_OPTIONS.map((opt) => {
            const ativo = statusAtual === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => handleStatus(opt.value)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '999px',
                  border: `1px solid ${ativo ? 'var(--na2s-lima)' : 'var(--na2s-borda)'}`,
                  backgroundColor: ativo ? 'rgba(200,255,87,0.1)' : 'var(--na2s-ardosia)',
                  color: ativo ? 'var(--na2s-lima)' : 'var(--na2s-texto-secundario)',
                  fontSize: '13px',
                  fontWeight: ativo ? 600 : 400,
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                }}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Técnico */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--na2s-texto-terciario)', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Técnico
        </label>
        <select
          value={tecnicoAtual}
          onChange={(e) => handleChange('tecnico_id', e.target.value)}
          style={{ ...INPUT_STYLE, cursor: 'pointer', minWidth: '160px' }}
        >
          <option value="">Todos os técnicos</option>
          {tecnicos.map((t) => (
            <option key={t.id} value={t.id}>{t.nome}</option>
          ))}
        </select>
      </div>

      {/* Período */}
      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--na2s-texto-terciario)', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          De
        </label>
        <input
          type="date"
          value={dataInicio}
          onChange={(e) => handleChange('data_inicio', e.target.value)}
          style={INPUT_STYLE}
        />
      </div>

      <div>
        <label style={{ display: 'block', fontSize: '11px', color: 'var(--na2s-texto-terciario)', marginBottom: '6px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Até
        </label>
        <input
          type="date"
          value={dataFim}
          onChange={(e) => handleChange('data_fim', e.target.value)}
          style={INPUT_STYLE}
        />
      </div>

      {/* Limpar */}
      {temFiltroAtivo && (
        <button
          onClick={limparFiltros}
          style={{ padding: '7px 16px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', backgroundColor: 'transparent', color: 'var(--na2s-texto-secundario)', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', alignSelf: 'flex-end' }}
        >
          Limpar filtros
        </button>
      )}
    </div>
  )
}
