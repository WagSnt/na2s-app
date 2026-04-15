import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const tecnico_id = request.nextUrl.searchParams.get('tecnico_id')

  if (!tecnico_id) {
    return NextResponse.json({ error: 'tecnico_id obrigatório' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('clientes')
    .select('id, nome, whatsapp')
    .eq('tecnico_id', tecnico_id)
    .order('nome', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
