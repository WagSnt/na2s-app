import { getFinanceiroConsolidado, getRepasses } from '@/app/actions/financeiro'
import { getTecnicos } from '@/app/actions/tecnicos'
import { FinanceiroClient } from '@/components/financeiro/FinanceiroClient'

interface Props {
  searchParams: Promise<{ mes?: string; todos?: string }>
}

function mesAtual(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

export default async function FinanceiroPage({ searchParams }: Props) {
  const { mes, todos } = await searchParams
  const mesRef = todos === '1' ? 'todos' : (mes ?? mesAtual())

  const [consolidado, repasses, tecnicos] = await Promise.all([
    getFinanceiroConsolidado(mesRef),
    getRepasses(),
    getTecnicos(),
  ])

  return (
    <FinanceiroClient
      consolidado={consolidado}
      repasses={repasses}
      tecnicos={tecnicos}
      mes={mesRef}
    />
  )
}
