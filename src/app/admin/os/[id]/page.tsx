import { notFound } from 'next/navigation'
import { getOSById } from '@/app/actions/ordens-servico'
import { OSDetalheClient } from '@/components/os/OSDetalheClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OSDetalhePage({ params }: Props) {
  const { id } = await params

  const os = await getOSById(id).catch(() => null)
  if (!os) notFound()

  return <OSDetalheClient os={os} />
}
