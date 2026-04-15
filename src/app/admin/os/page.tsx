import { getTodasOS } from '@/app/actions/ordens-servico'
import { getTecnicos } from '@/app/actions/tecnicos'
import { OSListagemClient } from '@/components/os/OSListagemClient'

interface Props {
  searchParams: Promise<{
    status?: string
    mes?: string
    tecnico_id?: string
    data_inicio?: string
    data_fim?: string
  }>
}

export default async function OSPage({ searchParams }: Props) {
  const { status, mes, tecnico_id, data_inicio, data_fim } = await searchParams

  const [ordens, tecnicos] = await Promise.all([
    getTodasOS({ status, mes, tecnico_id, data_inicio, data_fim }),
    getTecnicos(),
  ])

  return <OSListagemClient ordens={ordens} tecnicos={tecnicos} />
}
