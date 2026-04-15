import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tecnico_id = searchParams.get('tecnico_id')
  const inicio = searchParams.get('inicio')
  const fim = searchParams.get('fim')

  if (!tecnico_id || !inicio || !fim) {
    return NextResponse.json({ error: 'Parâmetros obrigatórios: tecnico_id, inicio, fim' }, { status: 400 })
  }

  const supabase = await createClient()

  const fimInclusive = new Date(fim)
  fimInclusive.setDate(fimInclusive.getDate() + 1)
  const fimExclusive = fimInclusive.toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('ordens_servico')
    .select('numero_os, valor_cobrado, comissao_valor, cliente:clientes(nome)')
    .eq('tecnico_id', tecnico_id)
    .eq('status', 'concluida')
    .gte('data_conclusao', inicio)
    .lt('data_conclusao', fimExclusive)
    .order('data_conclusao', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const os = data ?? []
  const valor_comissao = os.reduce((acc, o) => acc + (o.comissao_valor ?? 0), 0)
  const num_os = os.length

  const os_detalhes = os.map((o) => ({
    numero_os: o.numero_os,
    cliente: (o.cliente as unknown as { nome: string } | null)?.nome ?? '—',
    valor: o.valor_cobrado ?? 0,
    comissao: o.comissao_valor ?? 0,
  }))

  return NextResponse.json({ valor_comissao, num_os, os_detalhes })
}
