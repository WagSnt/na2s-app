import { notFound } from 'next/navigation'
import { getClienteById } from '@/app/actions/clientes'
import { getEquipamentosByCliente } from '@/app/actions/equipamentos'
import { getOSByCliente } from '@/app/actions/ordens-servico'
import { ClienteDetalheClient } from '@/components/clientes/ClienteDetalheClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ClienteDetalhePage({ params }: Props) {
  const { id } = await params

  const [cliente, equipamentos, os] = await Promise.all([
    getClienteById(id).catch(() => null),
    getEquipamentosByCliente(id).catch(() => []),
    getOSByCliente(id).catch(() => []),
  ])

  if (!cliente) notFound()

  return (
    <ClienteDetalheClient
      cliente={cliente}
      equipamentos={equipamentos}
      os={os}
    />
  )
}
