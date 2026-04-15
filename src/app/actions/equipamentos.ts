'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Equipamento } from '@/types'

export async function getEquipamentosByCliente(cliente_id: string): Promise<Equipamento[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipamentos')
    .select('*')
    .eq('cliente_id', cliente_id)
    .order('tipo', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export interface EquipamentoComManutencao extends Equipamento {
  cliente: { nome: string; whatsapp?: string } | null
  tecnico: { nome: string } | null
}

export async function getEquipamentosComManutencao(): Promise<EquipamentoComManutencao[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipamentos')
    .select('*, cliente:clientes(nome, whatsapp), tecnico:tecnicos(nome)')
    .not('proxima_manutencao', 'is', null)
    .order('proxima_manutencao', { ascending: true })

  if (error) throw new Error(error.message)
  return (data ?? []) as EquipamentoComManutencao[]
}

export async function criarEquipamento(
  formData: FormData
): Promise<{ success: true; equipamento_id: string } | { success: false; error: string }> {
  const supabase = await createClient()

  const cliente_id = formData.get('cliente_id') as string
  const tecnico_id = formData.get('tecnico_id') as string

  const btusRaw = formData.get('btus') as string
  const periodicidadeRaw = formData.get('periodicidade_meses') as string
  const ultimaManutencaoRaw = formData.get('ultima_manutencao') as string

  const payload = {
    cliente_id,
    tecnico_id,
    tipo: formData.get('tipo') as string,
    marca: (formData.get('marca') as string) || null,
    btus: btusRaw ? parseInt(btusRaw, 10) : null,
    ambiente: (formData.get('ambiente') as string) || null,
    ultima_manutencao: ultimaManutencaoRaw || null,
    periodicidade_meses: periodicidadeRaw ? parseInt(periodicidadeRaw, 10) : null,
    observacoes: (formData.get('observacoes') as string) || null,
  }

  const { data, error } = await supabase
    .from('equipamentos')
    .insert(payload)
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/admin/tecnicos/${tecnico_id}`)
  return { success: true, equipamento_id: data.id }
}

export async function atualizarUltimaManutencao(
  equipamento_id: string,
  data: string
): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('equipamentos')
    .update({ ultima_manutencao: data })
    .eq('id', equipamento_id)

  if (error) throw new Error(error.message)

  // Revalidar páginas que podem exibir este equipamento
  revalidatePath('/admin/os')
  revalidatePath('/admin/manutencoes')
}
