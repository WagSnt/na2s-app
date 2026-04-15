'use server'

import { createClient } from '@/lib/supabase/server'
import type { Pacote, StatusTecnico } from '@/types'

// ---- Helpers ----------------------------------------------------------------

function mesAtual(): string {
  const hoje = new Date()
  return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`
}

function proximoMes(mesRef: string): string {
  const [ano, mes] = mesRef.split('-').map(Number)
  return mes === 12
    ? `${ano + 1}-01-01`
    : `${ano}-${String(mes + 1).padStart(2, '0')}-01`
}

function mesesAnteriores(n: number): string[] {
  const meses: string[] = []
  const hoje = new Date()
  for (let i = 0; i < n; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1)
    meses.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`)
  }
  return meses
}

// ---- Tipos ------------------------------------------------------------------

export interface KPIsNA2S {
  tecnicosAtivos: number
  tecnicosPorStatus: Record<string, number>
  receitaMesAtual: number
  receitaRecebidaMes: number
  receitaPendenteMes: number
  faturamentoTecnicosMes: number
  osAbertas: number
  osConcluidas: number
  inadimplentesClientes: number
  ticketMedioGeral: number
  repassesPendentes: number
  mesRef: string
}

export interface TecnicoResumo {
  id: string
  nome: string
  status: StatusTecnico
  pacote: Pacote
  faturamento_mes: number
}

export interface TecnicoHistorico extends TecnicoResumo {
  faturamento_por_mes: Record<string, number> // mesRef -> valor
}

// ---- Queries ----------------------------------------------------------------

export async function getKPIsNA2S(): Promise<KPIsNA2S> {
  const supabase = await createClient()
  const mesRef = mesAtual()
  const inicioMes = `${mesRef}-01`
  const fimMes = proximoMes(mesRef)

  const [
    { count: tecnicosAtivosCount },
    { data: todosTecnicosData },
    { data: financeiroMesData },
    { count: osAbertasCount },
    { count: osConcluidasCount },
    { count: inadimplentesCount },
    { data: osValoresData },
    { data: repassesPendentesData },
  ] = await Promise.all([
    supabase
      .from('tecnicos')
      .select('*', { count: 'exact', head: true })
      .in('status', ['ativo', 'piloto']),

    supabase.from('tecnicos').select('status'),

    supabase
      .from('financeiro_mensal')
      .select('total_devido_na2s, faturamento_bruto, status_mensalidade')
      .eq('mes_referencia', mesRef),

    supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .in('status', ['agendada', 'em_andamento']),

    supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'concluida')
      .gte('data_conclusao', inicioMes)
      .lt('data_conclusao', fimMes),

    supabase
      .from('ordens_servico')
      .select('*', { count: 'exact', head: true })
      .eq('status_pagamento', 'inadimplente'),

    supabase
      .from('ordens_servico')
      .select('valor_cobrado')
      .eq('status', 'concluida')
      .gte('data_conclusao', inicioMes)
      .lt('data_conclusao', fimMes),

    supabase
      .from('repasses')
      .select('valor_total')
      .eq('status', 'pendente'),
  ])

  const tecnicosPorStatus: Record<string, number> = {}
  for (const t of todosTecnicosData ?? []) {
    tecnicosPorStatus[t.status] = (tecnicosPorStatus[t.status] ?? 0) + 1
  }

  const financeiro = financeiroMesData ?? []
  const receitaMesAtual = financeiro.reduce((a, r) => a + (r.total_devido_na2s ?? 0), 0)
  const receitaRecebidaMes = financeiro
    .filter((r) => r.status_mensalidade === 'pago')
    .reduce((a, r) => a + (r.total_devido_na2s ?? 0), 0)
  const receitaPendenteMes = financeiro
    .filter((r) => r.status_mensalidade !== 'pago')
    .reduce((a, r) => a + (r.total_devido_na2s ?? 0), 0)
  const faturamentoTecnicosMes = financeiro.reduce((a, r) => a + (r.faturamento_bruto ?? 0), 0)

  const osValores = osValoresData ?? []
  const ticketMedioGeral =
    osValores.length > 0
      ? osValores.reduce((a, o) => a + (o.valor_cobrado ?? 0), 0) / osValores.length
      : 0

  const repassesPendentes = (repassesPendentesData ?? []).reduce(
    (a, r) => a + (r.valor_total ?? 0),
    0
  )

  return {
    tecnicosAtivos: tecnicosAtivosCount ?? 0,
    tecnicosPorStatus,
    receitaMesAtual,
    receitaRecebidaMes,
    receitaPendenteMes,
    faturamentoTecnicosMes,
    osAbertas: osAbertasCount ?? 0,
    osConcluidas: osConcluidasCount ?? 0,
    inadimplentesClientes: inadimplentesCount ?? 0,
    ticketMedioGeral,
    repassesPendentes,
    mesRef,
  }
}

export async function getTecnicosResumo(): Promise<TecnicoResumo[]> {
  const supabase = await createClient()
  const mesRef = mesAtual()

  const [{ data: tecnicosData }, { data: financeiroData }] = await Promise.all([
    supabase
      .from('tecnicos')
      .select('id, nome, status, pacote')
      .order('nome', { ascending: true }),
    supabase
      .from('financeiro_mensal')
      .select('tecnico_id, faturamento_bruto')
      .eq('mes_referencia', mesRef),
  ])

  const faturamentoPorTecnico = new Map(
    (financeiroData ?? []).map((f) => [f.tecnico_id, f.faturamento_bruto ?? 0])
  )

  return (tecnicosData ?? [])
    .map((t) => ({
      id: t.id as string,
      nome: t.nome as string,
      status: t.status as StatusTecnico,
      pacote: t.pacote as Pacote,
      faturamento_mes: faturamentoPorTecnico.get(t.id) ?? 0,
    }))
    .sort((a, b) => b.faturamento_mes - a.faturamento_mes)
}

export async function getTecnicosHistorico(numMeses = 3): Promise<TecnicoHistorico[]> {
  const supabase = await createClient()
  const meses = mesesAnteriores(numMeses)

  const [{ data: tecnicosData }, { data: financeiroData }] = await Promise.all([
    supabase.from('tecnicos').select('id, nome, status, pacote').order('nome', { ascending: true }),
    supabase
      .from('financeiro_mensal')
      .select('tecnico_id, faturamento_bruto, mes_referencia')
      .in('mes_referencia', meses),
  ])

  // Construir mapa: tecnico_id -> { mesRef -> faturamento }
  const hist = new Map<string, Record<string, number>>()
  for (const f of financeiroData ?? []) {
    if (!hist.has(f.tecnico_id)) hist.set(f.tecnico_id, {})
    hist.get(f.tecnico_id)![f.mes_referencia] = f.faturamento_bruto ?? 0
  }

  const [mesAtualRef] = meses

  return (tecnicosData ?? [])
    .map((t) => {
      const porMes = hist.get(t.id) ?? {}
      return {
        id: t.id as string,
        nome: t.nome as string,
        status: t.status as StatusTecnico,
        pacote: t.pacote as Pacote,
        faturamento_mes: porMes[mesAtualRef] ?? 0,
        faturamento_por_mes: porMes,
      }
    })
    .sort((a, b) => b.faturamento_mes - a.faturamento_mes)
}

export async function getFinanceiroHistorico(
  numMeses = 3
): Promise<Array<{ mes: string; receita: number; recebido: number; faturamento: number }>> {
  const supabase = await createClient()
  const meses = mesesAnteriores(numMeses)

  const { data } = await supabase
    .from('financeiro_mensal')
    .select('mes_referencia, total_devido_na2s, status_mensalidade, faturamento_bruto')
    .in('mes_referencia', meses)

  // Agrupar por mês
  const porMes = new Map<string, { receita: number; recebido: number; faturamento: number }>()
  for (const mes of meses) porMes.set(mes, { receita: 0, recebido: 0, faturamento: 0 })

  for (const r of data ?? []) {
    const entry = porMes.get(r.mes_referencia)
    if (!entry) continue
    entry.receita += r.total_devido_na2s ?? 0
    entry.faturamento += r.faturamento_bruto ?? 0
    if (r.status_mensalidade === 'pago') entry.recebido += r.total_devido_na2s ?? 0
  }

  return meses.map((mes) => ({ mes, ...porMes.get(mes)! }))
}
