import { getTecnicos } from '@/app/actions/tecnicos'
import { TecnicosListagem } from '@/components/tecnicos/TecnicosListagem'

export default async function TecnicosPage() {
  const tecnicos = await getTecnicos()

  return <TecnicosListagem tecnicos={tecnicos} />
}
