'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { FinanceiroMensal, Repasse, StatusPagamentoMensal, StatusRepasse } from '@/types'

// ---- Helpers ----------------------------------------------------------------

function mesAtual(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

// ---- Consultas — Financeiro Mensal ------------------------------------------

export async function getFinanceiroMensal(
  tecnico_id: string,
  mes_referencia?: string
): Promise<FinanceiroMensal[]> {
  const supabase = await createClient()

  let query = supabase
    .from('financeiro_mensal')
    .select('*, tecnico:tecnicos(nome, pacote)')
    .eq('tecnico_id', tecnico_id)
    .order('mes_referencia', { ascending: false })

  if (mes_referencia) {
    query = query.eq('mes_referencia', mes_referencia)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as FinanceiroMensal[]
}

export interface FinanceiroConsolidado {
  registros: FinanceiroMensal[]
  total_faturamento: number
  total_devido_na2s: number
  total_recebido: number
  count_inadimplentes: number
}

export async function getFinanceiroConsolidado(
  mes_referencia?: string
): Promise<FinanceiroConsolidado> {
  const supabase = await createClient()
  const mostrarTodos = !mes_referencia || mes_referencia === 'todos'

  let query = supabase
    .from('financeiro_mensal')
    .select('*, tecnico:tecnicos(nome, pacote)')

  if (mostrarTodos) {
    query = query.order('mes_referencia', { ascending: false })
  } else {
    query = query.eq('mes_referencia', mes_referencia).order('tecnico_id', { ascending: true })
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  const registros = (data ?? []) as FinanceiroMensal[]

  const total_faturamento = registros.reduce((acc, r) => acc + (r.faturamento_bruto ?? 0), 0)
  const total_devido_na2s = registros.reduce((acc, r) => acc + (r.total_devido_na2s ?? 0), 0)
  const total_recebido = registros
    .filter((r) => r.status_mensalidade === 'pago')
    .reduce((acc, r) => acc + (r.total_devido_na2s ?? 0), 0)
  const count_inadimplentes = registros.filter((r) => r.status_mensalidade === 'inadimplente').length

  return { registros, total_faturamento, total_devido_na2s, total_recebido, count_inadimplentes }
}

// ---- Mutações — Financeiro Mensal -------------------------------------------

export async function gerarFinanceiroMensal(
  tecnico_id: string,
  mes_referencia: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

  // Intervalo do mês
  const [ano, mes] = mes_referencia.split('-').map(Number)
  const inicioMes = `${mes_referencia}-01`
  const fimMes =
    mes === 12
      ? `${ano + 1}-01-01`
      : `${ano}-${String(mes + 1).padStart(2, '0')}-01`

  // Buscar OS concluídas no mês
  const { data: osData, error: osError } = await supabase
    .from('ordens_servico')
    .select('valor_cobrado, comissao_valor')
    .eq('tecnico_id', tecnico_id)
    .eq('status', 'concluida')
    .gte('data_conclusao', inicioMes)
    .lt('data_conclusao', fimMes)

  if (osError) return { success: false, error: osError.message }

  const os = osData ?? []
  const faturamento_bruto = os.reduce((acc, o) => acc + (o.valor_cobrado ?? 0), 0)
  const num_os_concluidas = os.length
  const total_comissao_na2s = os.reduce((acc, o) => acc + (o.comissao_valor ?? 0), 0)

  // Buscar contrato ativo do técnico
  const { data: contratoData, error: contratoError } = await supabase
    .from('contratos')
    .select('mensalidade_valor, data_inicio')
    .eq('tecnico_id', tecnico_id)
    .eq('status', 'ativo')
    .single()

  if (contratoError) return { success: false, error: contratoError.message }

  // Validar que mes_referencia >= mês de início do contrato
  const mesInicioContrato = (contratoData.data_inicio as string).slice(0, 7)
  if (mes_referencia < mesInicioContrato) {
    return { success: false, error: 'Técnico não possui histórico neste período.' }
  }

  const mensalidade_valor = contratoData?.mensalidade_valor ?? 0

  // Calcular data de vencimento: dia_cobranca do técnico no mês seguinte
  const { data: tecnicoData, error: tecnicoError } = await supabase
    .from('tecnicos')
    .select('dia_cobranca')
    .eq('id', tecnico_id)
    .single()

  if (tecnicoError) return { success: false, error: tecnicoError.message }

  const diaCobranca = tecnicoData?.dia_cobranca ?? 5
  const anoVenc = mes === 12 ? ano + 1 : ano
  const mesVenc = mes === 12 ? 1 : mes + 1
  const data_vencimento_mensalidade = `${anoVenc}-${String(mesVenc).padStart(2, '0')}-${String(diaCobranca).padStart(2, '0')}`

  // UPSERT em financeiro_mensal
  const payload = {
    tecnico_id,
    mes_referencia,
    faturamento_bruto,
    num_os_concluidas,
    total_comissao_na2s,
    mensalidade_valor,
    status_mensalidade: 'pendente' as StatusPagamentoMensal,
    data_vencimento_mensalidade,
  }

  const { error: upsertError } = await supabase
    .from('financeiro_mensal')
    .upsert(payload, { onConflict: 'tecnico_id,mes_referencia', ignoreDuplicates: false })

  if (upsertError) return { success: false, error: upsertError.message }

  revalidatePath('/admin/financeiro')
  return { success: true }
}

export async function atualizarStatusMensalidade(
  id: string,
  status: StatusPagamentoMensal,
  data_pagamento?: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

  const payload: Record<string, unknown> = { status_mensalidade: status }
  if (data_pagamento) payload.data_pagamento_mensalidade = data_pagamento

  const { error } = await supabase
    .from('financeiro_mensal')
    .update(payload)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/financeiro')
  return { success: true }
}

// ---- Consultas — Repasses ---------------------------------------------------

export async function getRepasses(tecnico_id?: string): Promise<Repasse[]> {
  const supabase = await createClient()

  let query = supabase
    .from('repasses')
    .select('*, tecnico:tecnicos(nome)')
    .order('data_vencimento', { ascending: false })

  if (tecnico_id) {
    query = query.eq('tecnico_id', tecnico_id)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []) as Repasse[]
}

// ---- Mutações — Repasses ----------------------------------------------------

export async function gerarRepasse(
  tecnico_id: string,
  periodo_inicio: string,
  periodo_fim: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

  // Buscar OS concluídas no período com comissao_valor
  const fimInclusive = new Date(periodo_fim)
  fimInclusive.setDate(fimInclusive.getDate() + 1)
  const fimExclusive = fimInclusive.toISOString().split('T')[0]

  const { data: osData, error: osError } = await supabase
    .from('ordens_servico')
    .select('comissao_valor')
    .eq('tecnico_id', tecnico_id)
    .eq('status', 'concluida')
    .gte('data_conclusao', periodo_inicio)
    .lt('data_conclusao', fimExclusive)

  if (osError) return { success: false, error: osError.message }

  const os = osData ?? []
  const valor_comissao = os.reduce((acc, o) => acc + (o.comissao_valor ?? 0), 0)
  const valor_total = valor_comissao

  // data_vencimento = periodo_fim + 5 dias
  const dataVenc = new Date(periodo_fim)
  dataVenc.setDate(dataVenc.getDate() + 5)
  const data_vencimento = dataVenc.toISOString().split('T')[0]

  const { error: insertError } = await supabase.from('repasses').insert({
    tecnico_id,
    periodo_inicio,
    periodo_fim,
    valor_comissao,
    valor_total,
    status: 'pendente' as StatusRepasse,
    data_vencimento,
  })

  if (insertError) return { success: false, error: insertError.message }

  revalidatePath('/admin/financeiro')
  return { success: true }
}

export async function atualizarStatusRepasse(
  id: string,
  status: StatusRepasse,
  data_pagamento?: string
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

  const payload: Record<string, unknown> = { status }
  if (data_pagamento) payload.data_pagamento = data_pagamento

  const { error } = await supabase
    .from('repasses')
    .update(payload)
    .eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/financeiro')
  return { success: true }
}
