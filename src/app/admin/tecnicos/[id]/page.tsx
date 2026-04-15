import { notFound } from 'next/navigation'
import { headers } from 'next/headers'
import { getTecnicoById } from '@/app/actions/tecnicos'
import { getClientesByTecnico } from '@/app/actions/clientes'
import { getOSByTecnico } from '@/app/actions/ordens-servico'
import { TecnicoDetalhesClient } from '@/components/tecnicos/TecnicoDetalhesClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function TecnicoDetalhesPage({ params }: Props) {
  const { id } = await params

  const [tecnicoData, clientes, osAgendadas, osAndamento] = await Promise.all([
    getTecnicoById(id).catch(() => null),
    getClientesByTecnico(id).catch(() => []),
    getOSByTecnico(id, { status: 'agendada' }).catch(() => []),
    getOSByTecnico(id, { status: 'em_andamento' }).catch(() => []),
  ])

  if (!tecnicoData) notFound()

  const osAbertas = [...osAgendadas, ...osAndamento].sort((a, b) => {
    if (!a.data_agendamento) return 1
    if (!b.data_agendamento) return -1
    return a.data_agendamento.localeCompare(b.data_agendamento)
  })

  // Extrair contrato ativo (pode vir como array do join)
  const contratos = Array.isArray(tecnicoData.contratos)
    ? tecnicoData.contratos
    : tecnicoData.contratos
    ? [tecnicoData.contratos]
    : []
  const contrato = contratos[0] ?? null

  // Derivar origin para montar o link do técnico
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const proto = headersList.get('x-forwarded-proto') ?? 'http'
  const origin = `${proto}://${host}`

  return (
    <TecnicoDetalhesClient
      tecnico={tecnicoData}
      contrato={contrato}
      clientes={clientes}
      osAbertas={osAbertas}
      origin={origin}
    />
  )
}
