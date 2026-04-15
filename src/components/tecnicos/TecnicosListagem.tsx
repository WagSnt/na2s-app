'use client'

import { useState } from 'react'
import { Users } from 'lucide-react'
import { TecnicoCard } from './TecnicoCard'
import { NovoTecnicoModal } from './NovoTecnicoModal'
import type { StatusTecnico, Pacote } from '@/types'

interface TecnicoItem {
  id: string
  nome: string
  whatsapp_pessoal: string
  pacote: Pacote
  status: StatusTecnico
  data_inicio: string
  token_acesso: string
}

export function TecnicosListagem({ tecnicos }: { tecnicos: TecnicoItem[] }) {
  const [modalAberto, setModalAberto] = useState(false)

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '32px',
          flexWrap: 'wrap',
        }}
      >
        <div>
          <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0 }}>
            Técnicos
          </h1>
          <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', margin: '6px 0 0' }}>
            Gerencie sua carteira de parceiros.
          </p>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          style={{
            backgroundColor: 'var(--na2s-lima)',
            color: 'var(--na2s-noite)',
            border: 'none',
            borderRadius: '999px',
            padding: '10px 20px',
            fontWeight: 700,
            fontSize: '14px',
            cursor: 'pointer',
            fontFamily: 'inherit',
            whiteSpace: 'nowrap',
          }}
        >
          + Novo técnico
        </button>
      </div>

      {/* Grid ou estado vazio */}
      {tecnicos.length === 0 ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '80px 20px',
            gap: '16px',
          }}
        >
          <Users size={48} color="var(--na2s-texto-mudo)" />
          <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', margin: 0 }}>
            Nenhum técnico cadastrado ainda.
          </p>
          <button
            onClick={() => setModalAberto(true)}
            style={{
              backgroundColor: 'var(--na2s-lima)',
              color: 'var(--na2s-noite)',
              border: 'none',
              borderRadius: '999px',
              padding: '10px 24px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Cadastrar primeiro técnico
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '16px',
          }}
        >
          {tecnicos.map((t) => (
            <TecnicoCard key={t.id} {...t} />
          ))}
        </div>
      )}

      {/* Modal */}
      {modalAberto && <NovoTecnicoModal onClose={() => setModalAberto(false)} />}
    </>
  )
}
