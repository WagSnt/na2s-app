import Link from 'next/link'
import { UserCheck } from 'lucide-react'
import { getClientesGlobal } from '@/app/actions/clientes'

function formatDate(str?: string | null) {
  if (!str) return null
  return new Date(str).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function ClientesPage() {
  const clientes = await getClientesGlobal()

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ color: 'var(--na2s-papel)', fontSize: '28px', fontWeight: 700, margin: 0 }}>
          Clientes
        </h1>
        <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', margin: '6px 0 0' }}>
          {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}
          {clientes.length === 50 ? ' (exibindo últimos 50)' : ''}
        </p>
      </div>

      {clientes.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px', gap: '16px' }}>
          <UserCheck size={48} color="var(--na2s-texto-mudo)" />
          <p style={{ color: 'var(--na2s-texto-secundario)', fontSize: '15px', margin: 0 }}>
            Nenhum cliente cadastrado.
          </p>
          <p style={{ color: 'var(--na2s-texto-mudo)', fontSize: '13px', margin: 0, textAlign: 'center' }}>
            Clientes são adicionados na página de cada técnico.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {clientes.map((cliente) => (
            <div
              key={cliente.id}
              style={{ backgroundColor: 'var(--na2s-ardosia)', border: '1px solid var(--na2s-borda)', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}
            >
              {/* Dados do cliente */}
              <div style={{ flex: 1, minWidth: '160px' }}>
                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--na2s-papel)', marginBottom: '4px' }}>
                  {cliente.nome}
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {cliente.whatsapp && (
                    <a
                      href={`https://wa.me/55${cliente.whatsapp.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '13px', color: 'var(--na2s-lima)', textDecoration: 'none' }}
                    >
                      {cliente.whatsapp}
                    </a>
                  )}
                  {cliente.endereco_cidade && (
                    <span style={{ fontSize: '13px', color: 'var(--na2s-texto-secundario)' }}>
                      {cliente.endereco_cidade}
                    </span>
                  )}
                </div>
              </div>

              {/* Técnico */}
              {cliente.tecnico && (
                <div style={{ fontSize: '12px', color: 'var(--na2s-texto-secundario)', whiteSpace: 'nowrap' }}>
                  Técnico: <span style={{ color: 'var(--na2s-papel)', fontWeight: 500 }}>{cliente.tecnico.nome}</span>
                </div>
              )}

              {/* Cadastrado em */}
              {formatDate(cliente.created_at) && (
                <div style={{ fontSize: '12px', color: 'var(--na2s-texto-mudo)', whiteSpace: 'nowrap' }}>
                  {formatDate(cliente.created_at)}
                </div>
              )}

              {/* Botão */}
              {cliente.tecnico_id && (
                <Link
                  href={`/admin/tecnicos/${cliente.tecnico_id}`}
                  style={{ padding: '6px 14px', borderRadius: '999px', border: '1px solid var(--na2s-borda)', color: 'var(--na2s-papel)', fontSize: '12px', fontWeight: 500, textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0 }}
                >
                  Ver técnico
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
