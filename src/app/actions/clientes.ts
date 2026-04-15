'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { Cliente } from '@/types'

export async function getClientesByTecnico(tecnico_id: string): Promise<Cliente[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('tecnico_id', tecnico_id)
    .order('nome', { ascending: true })

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getClienteById(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clientes')
    .select(`
      *,
      tecnico:tecnicos (nome)
    `)
    .eq('id', id)
    .single()

  if (error) throw new Error(error.message)
  return data as Cliente & { tecnico: { nome: string } | null }
}

export async function editarCliente(
  formData: FormData
): Promise<{ success: true } | { success: false; error: string }> {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const tecnico_id = formData.get('tecnico_id') as string

  const payload = {
    nome: formData.get('nome') as string,
    whatsapp: (formData.get('whatsapp') as string) || null,
    email: (formData.get('email') as string) || null,
    cpf: (formData.get('cpf') as string) || null,
    data_nascimento: (formData.get('data_nascimento') as string) || null,
    endereco_rua: (formData.get('endereco_rua') as string) || null,
    endereco_numero: (formData.get('endereco_numero') as string) || null,
    endereco_bairro: (formData.get('endereco_bairro') as string) || null,
    endereco_cidade: (formData.get('endereco_cidade') as string) || null,
    endereco_cep: (formData.get('endereco_cep') as string) || null,
    observacoes: (formData.get('observacoes') as string) || null,
  }

  const { error } = await supabase.from('clientes').update(payload).eq('id', id)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/admin/clientes/${id}`)
  if (tecnico_id) revalidatePath(`/admin/tecnicos/${tecnico_id}`)
  return { success: true }
}

export async function getClientesGlobal(limite = 50): Promise<
  Array<Cliente & { tecnico: { nome: string } | null }>
> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clientes')
    .select('*, tecnico:tecnicos(nome)')
    .order('created_at', { ascending: false })
    .limit(limite)

  if (error) throw new Error(error.message)
  return (data ?? []) as Array<Cliente & { tecnico: { nome: string } | null }>
}

export async function criarCliente(
  formData: FormData
): Promise<{ success: true; cliente_id: string } | { success: false; error: string }> {
  const supabase = await createClient()

  const tecnico_id = formData.get('tecnico_id') as string

  const payload = {
    tecnico_id,
    nome: formData.get('nome') as string,
    whatsapp: (formData.get('whatsapp') as string) || null,
    email: (formData.get('email') as string) || null,
    cpf: (formData.get('cpf') as string) || null,
    data_nascimento: (formData.get('data_nascimento') as string) || null,
    endereco_rua: (formData.get('endereco_rua') as string) || null,
    endereco_numero: (formData.get('endereco_numero') as string) || null,
    endereco_bairro: (formData.get('endereco_bairro') as string) || null,
    endereco_cidade: (formData.get('endereco_cidade') as string) || null,
    endereco_cep: (formData.get('endereco_cep') as string) || null,
    observacoes: (formData.get('observacoes') as string) || null,
  }

  const { data, error } = await supabase
    .from('clientes')
    .insert(payload)
    .select('id')
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath(`/admin/tecnicos/${tecnico_id}`)
  return { success: true, cliente_id: data.id }
}
