'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Tecnico, Pacote } from '@/types'

const VALORES_PACOTE: Record<Pacote, { mensalidade: number; comissao: number }> = {
  starter: { mensalidade: 997, comissao: 5 },
  pro: { mensalidade: 1497, comissao: 8 },
  full: { mensalidade: 2497, comissao: 8 },
}

export async function getTecnicos(): Promise<
  Pick<Tecnico, 'id' | 'nome' | 'whatsapp_pessoal' | 'pacote' | 'status' | 'data_inicio' | 'token_acesso'>[]
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tecnicos')
    .select('id, nome, whatsapp_pessoal, pacote, status, data_inicio, token_acesso')
    .order('nome', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTecnicoById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tecnicos')
    .select(`
      *,
      contratos (*)
    `)
    .eq('id', id)
    .eq('contratos.status', 'ativo')
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function criarTecnico(
  formData: FormData
): Promise<{ success: true; tecnico_id: string } | { success: false; error: string }> {
  const supabase = await createClient()

  const pacote = formData.get('pacote') as Pacote
  const ehPiloto = formData.get('eh_piloto') === 'true'

  // Montar objeto do técnico
  const tecnicoPayload = {
    nome: formData.get('nome') as string,
    whatsapp_pessoal: formData.get('whatsapp_pessoal') as string,
    whatsapp_negocio: (formData.get('whatsapp_negocio') as string) || null,
    email: (formData.get('email') as string) || null,
    instagram: (formData.get('instagram') as string) || null,
    pacote,
    status: ehPiloto ? 'piloto' : 'ativo',
    origem: (formData.get('origem') as string) || null,
    data_inicio: formData.get('data_inicio') as string,
    dia_cobranca: parseInt(formData.get('dia_cobranca') as string, 10) || 5,
    observacoes: (formData.get('observacoes') as string) || null,
  }

  const { data: tecnico, error: tecnicoError } = await supabase
    .from('tecnicos')
    .insert(tecnicoPayload)
    .select('id')
    .single()

  if (tecnicoError) {
    return { success: false, error: tecnicoError.message }
  }

  // Montar valores do contrato
  const { mensalidade, comissao } = VALORES_PACOTE[pacote]
  const contratoPayload = {
    tecnico_id: tecnico.id,
    pacote,
    mensalidade_valor: ehPiloto ? 497 : mensalidade,
    comissao_pct: ehPiloto ? 0 : comissao,
    status: 'ativo',
    eh_piloto: ehPiloto,
    mes_piloto_atual: ehPiloto ? 1 : null,
    prazo_minimo_meses: 3,
    data_inicio: tecnicoPayload.data_inicio,
  }

  const { error: contratoError } = await supabase
    .from('contratos')
    .insert(contratoPayload)

  if (contratoError) {
    // Técnico foi criado mas o contrato falhou — retornar erro informativo
    return { success: false, error: `Técnico criado, mas falha no contrato: ${contratoError.message}` }
  }

  revalidatePath('/admin/tecnicos')
  return { success: true, tecnico_id: tecnico.id }
}

export async function getTecnicoPorToken(token: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tecnicos')
    .select(`
      *,
      contratos (*)
    `)
    .eq('token_acesso', token)
    .eq('contratos.status', 'ativo')
    .single()

  if (error) return null
  return data
}

export async function editarTecnico(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

  const id = formData.get('id') as string

  const payload = {
    nome: formData.get('nome') as string,
    whatsapp_pessoal: formData.get('whatsapp_pessoal') as string,
    whatsapp_negocio: (formData.get('whatsapp_negocio') as string) || null,
    email: (formData.get('email') as string) || null,
    instagram: (formData.get('instagram') as string) || null,
    status: formData.get('status') as string,
    dia_cobranca: parseInt(formData.get('dia_cobranca') as string, 10) || 5,
    observacoes: (formData.get('observacoes') as string) || null,
  }

  const { error } = await supabase.from('tecnicos').update(payload).eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/admin/tecnicos')
  revalidatePath(`/admin/tecnicos/${id}`)
  return { success: true }
}

export async function atualizarStatusTecnico(id: string, status: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('tecnicos')
    .update({ status })
    .eq('id', id)

  if (error) throw new Error(error.message)

  revalidatePath('/admin/tecnicos')
  revalidatePath(`/admin/tecnicos/${id}`)
}
