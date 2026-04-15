'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { OrdemServico, StatusOS } from '@/types'

const OS_SELECT = `
  *,
  cliente:clientes (nome, whatsapp),
  tecnico:tecnicos (nome),
  equipamentos:os_equipamentos (
    equipamento:equipamentos (*)
  )
`

function normalizeOS(row: Record<string, unknown>): OrdemServico {
  // os_equipamentos retorna { equipamento: {...} } — extrair array plano
  const rawEquips = (row.equipamentos as Array<{ equipamento: unknown }> | null) ?? []
  return {
    ...row,
    equipamentos: rawEquips.map((e) => e.equipamento),
  } as OrdemServico
}

// ---- Consultas ----------------------------------------------------------------

export async function getOSByTecnico(
  tecnico_id: string,
  filtros?: { status?: string; mes?: string }
): Promise<OrdemServico[]> {
  const supabase = await createClient()

  let query = supabase
    .from('ordens_servico')
    .select(OS_SELECT)
    .eq('tecnico_id', tecnico_id)
    .order('data_agendamento', { ascending: false })

  if (filtros?.status) query = query.eq('status', filtros.status)
  if (filtros?.mes) {
    const inicio = `${filtros.mes}-01`
    const [ano, mes] = filtros.mes.split('-').map(Number)
    const proximoMes = mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    query = query.gte('data_agendamento', inicio).lt('data_agendamento', proximoMes)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map(normalizeOS)
}

export async function getTodasOS(filtros?: {
  status?: string
  mes?: string
  tecnico_id?: string
  data_inicio?: string
  data_fim?: string
}): Promise<OrdemServico[]> {
  const supabase = await createClient()

  let query = supabase
    .from('ordens_servico')
    .select(OS_SELECT)
    .order('data_agendamento', { ascending: false })

  if (filtros?.status) query = query.eq('status', filtros.status)
  if (filtros?.tecnico_id) query = query.eq('tecnico_id', filtros.tecnico_id)
  if (filtros?.mes) {
    const inicio = `${filtros.mes}-01`
    const [ano, mes] = filtros.mes.split('-').map(Number)
    const proximoMes = mes === 12 ? `${ano + 1}-01-01` : `${ano}-${String(mes + 1).padStart(2, '0')}-01`
    query = query.gte('data_agendamento', inicio).lt('data_agendamento', proximoMes)
  }
  if (filtros?.data_inicio) {
    query = query.gte('data_agendamento', filtros.data_inicio)
  }
  if (filtros?.data_fim) {
    // Incluir o dia final inteiro
    const d = new Date(filtros.data_fim + 'T00:00:00')
    d.setDate(d.getDate() + 1)
    query = query.lt('data_agendamento', d.toISOString().split('T')[0])
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map(normalizeOS)
}

export async function getOSById(id: string): Promise<OrdemServico> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ordens_servico')
    .select(OS_SELECT)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return normalizeOS(data as Record<string, unknown>)
}

// ---- Mutações ----------------------------------------------------------------

export async function abrirOS(
  formData: FormData
): Promise<{ success: true; os_id: string } | { success: false; error: string }> {
  const supabase = await createClient()

  const tecnico_id = formData.get('tecnico_id') as string
  const equipamentosIds: string[] = JSON.parse((formData.get('equipamentos_ids') as string) || '[]')

  const payload = {
    tecnico_id,
    cliente_id: formData.get('cliente_id') as string,
    tipo_servico: (formData.get('tipo_servico') as string) || null,
    descricao_solicitacao: (formData.get('descricao_solicitacao') as string) || null,
    data_agendamento: (formData.get('data_agendamento') as string) || null,
    observacoes: (formData.get('observacoes') as string) || null,
    status: 'agendada',
  }

  const { data: os, error: osError } = await supabase
    .from('ordens_servico')
    .insert(payload)
    .select('id')
    .single()

  if (osError) return { success: false, error: osError.message }

  if (equipamentosIds.length > 0) {
    const juncao = equipamentosIds.map((eid) => ({
      os_id: os.id,
      equipamento_id: eid,
    }))
    const { error: juncaoError } = await supabase.from('os_equipamentos').insert(juncao)
    if (juncaoError) return { success: false, error: juncaoError.message }
  }

  revalidatePath('/admin/os')
  revalidatePath(`/admin/tecnicos/${tecnico_id}`)
  return { success: true, os_id: os.id }
}

export async function fecharOS(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

  const os_id = formData.get('os_id') as string
  const valor_cobrado = parseFloat(formData.get('valor_cobrado') as string) || 0
  const data_conclusao = (formData.get('data_conclusao') as string) || new Date().toISOString().split('T')[0]

  // Buscar OS para obter tecnico_id
  const { data: osAtual, error: osErr } = await supabase
    .from('ordens_servico')
    .select('tecnico_id')
    .eq('id', os_id)
    .single()

  if (osErr) return { success: false, error: osErr.message }

  // Buscar contrato ativo do técnico
  const { data: contrato } = await supabase
    .from('contratos')
    .select('comissao_pct')
    .eq('tecnico_id', osAtual.tecnico_id)
    .eq('status', 'ativo')
    .single()

  const comissao_pct = contrato?.comissao_pct ?? 0
  const comissao_valor = valor_cobrado * (comissao_pct / 100)

  const updatePayload = {
    status: 'concluida',
    o_que_foi_feito: (formData.get('o_que_foi_feito') as string) || null,
    valor_cobrado,
    forma_pagamento: (formData.get('forma_pagamento') as string) || null,
    status_pagamento: (formData.get('status_pagamento') as string) || null,
    data_pagamento: (formData.get('data_pagamento') as string) || null,
    data_conclusao,
    comissao_pct,
    comissao_valor,
  }

  const { error: updateError } = await supabase
    .from('ordens_servico')
    .update(updatePayload)
    .eq('id', os_id)

  if (updateError) return { success: false, error: updateError.message }

  // Atualizar ultima_manutencao nos equipamentos vinculados a esta OS
  const { data: osEquips } = await supabase
    .from('os_equipamentos')
    .select('equipamento_id')
    .eq('os_id', os_id)

  if (osEquips && osEquips.length > 0) {
    const ids = osEquips.map((e) => e.equipamento_id)
    await supabase
      .from('equipamentos')
      .update({ ultima_manutencao: data_conclusao })
      .in('id', ids)
  }

  revalidatePath('/admin/os')
  revalidatePath(`/admin/os/${os_id}`)
  revalidatePath(`/admin/tecnicos/${osAtual.tecnico_id}`)
  return { success: true }
}

export async function cancelarOS(
  os_id: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('ordens_servico')
    .update({ status: 'cancelada' })
    .eq('id', os_id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/os')
  revalidatePath(`/admin/os/${os_id}`)
}

export async function atualizarStatusOS(
  os_id: string,
  status: StatusOS
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('ordens_servico')
    .update({ status })
    .eq('id', os_id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/os')
  revalidatePath(`/admin/os/${os_id}`)
}

export async function getOSByCliente(
  cliente_id: string,
  limite = 10
): Promise<OrdemServico[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ordens_servico')
    .select(`
      id, numero_os, tipo_servico, status, status_pagamento,
      valor_cobrado, data_agendamento, data_conclusao,
      tecnico:tecnicos (nome)
    `)
    .eq('cliente_id', cliente_id)
    .order('created_at', { ascending: false })
    .limit(limite)

  if (error) throw new Error(error.message)
  return (data ?? []) as unknown as OrdemServico[]
}

export async function editarOS(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

  const os_id = formData.get('os_id') as string
  const status = formData.get('status') as string

  const updatePayload = {
    tipo_servico: (formData.get('tipo_servico') as string) || null,
    descricao_solicitacao: (formData.get('descricao_solicitacao') as string) || null,
    data_agendamento: (formData.get('data_agendamento') as string) || null,
    observacoes: (formData.get('observacoes') as string) || null,
    status,
  }

  const { error } = await supabase
    .from('ordens_servico')
    .update(updatePayload)
    .eq('id', os_id)
    .neq('status', 'concluida')
    .neq('status', 'cancelada')

  if (error) return { success: false, error: error.message }

  // Log de auditoria — falha silenciosa se tabela não existir
  try {
    await supabase
      .from('os_log')
      .insert({ os_id, campo_alterado: 'edicao_geral', valor_novo: 'editado por stephanie' })
  } catch { /* tabela pode não existir */ }

  revalidatePath('/admin/os')
  revalidatePath(`/admin/os/${os_id}`)
  return { success: true }
}

// ---- Dashboard público do técnico ----------------------------------------

export interface DashboardTecnico {
  osAbertas: Array<{ id: string; cliente: { nome: string } | null; tipo_servico: string | null; data_agendamento: string | null; status: string }>
  osDoMes: Array<{ id: string; numero_os: number; cliente: { nome: string } | null; valor_cobrado: number | null }>
  faturamentoMes: number
  inadimplentes: Array<{ id: string; numero_os: number; cliente: { nome: string } | null; valor_cobrado: number | null }>
  proximasManutencoes: Array<{ id: string; tipo: string; marca: string | null; proxima_manutencao: string; cliente: { nome: string } | null }>
}

export async function getOSDashboardTecnico(tecnico_id: string): Promise<DashboardTecnico> {
  const supabase = await createClient()

  const hoje = new Date()
  const inicioMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`
  const proximoMes = hoje.getMonth() === 11
    ? `${hoje.getFullYear() + 1}-01-01`
    : `${hoje.getFullYear()}-${String(hoje.getMonth() + 2).padStart(2, '0')}-01`
  const em30Dias = new Date(hoje)
  em30Dias.setDate(hoje.getDate() + 30)
  const em30DiasStr = em30Dias.toISOString().split('T')[0]
  const hojeStr = hoje.toISOString().split('T')[0]

  const [abertas, doMes, inadimplentes, manutencoes] = await Promise.all([
    supabase
      .from('ordens_servico')
      .select('id, status, tipo_servico, data_agendamento, cliente:clientes(nome)')
      .eq('tecnico_id', tecnico_id)
      .in('status', ['agendada', 'em_andamento'])
      .order('data_agendamento', { ascending: true }),

    supabase
      .from('ordens_servico')
      .select('id, numero_os, valor_cobrado, cliente:clientes(nome)')
      .eq('tecnico_id', tecnico_id)
      .eq('status', 'concluida')
      .gte('data_conclusao', inicioMes)
      .lt('data_conclusao', proximoMes),

    supabase
      .from('ordens_servico')
      .select('id, numero_os, valor_cobrado, cliente:clientes(nome)')
      .eq('tecnico_id', tecnico_id)
      .eq('status_pagamento', 'inadimplente'),

    supabase
      .from('equipamentos')
      .select('id, tipo, marca, proxima_manutencao, cliente:clientes(nome)')
      .eq('tecnico_id', tecnico_id)
      .gte('proxima_manutencao', hojeStr)
      .lte('proxima_manutencao', em30DiasStr)
      .order('proxima_manutencao', { ascending: true }),
  ])

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cast = <T,>(data: unknown): T => data as T

  const osDoMes = cast<DashboardTecnico['osDoMes']>(doMes.data ?? [])
  const faturamentoMes = osDoMes.reduce((acc, os) => acc + (os.valor_cobrado ?? 0), 0)

  return {
    osAbertas: cast<DashboardTecnico['osAbertas']>(abertas.data ?? []),
    osDoMes,
    faturamentoMes,
    inadimplentes: cast<DashboardTecnico['inadimplentes']>(inadimplentes.data ?? []),
    proximasManutencoes: cast<DashboardTecnico['proximasManutencoes']>(manutencoes.data ?? []),
  }
}
