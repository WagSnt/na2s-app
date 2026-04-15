import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const cliente_id = request.nextUrl.searchParams.get('cliente_id')

  if (!cliente_id) {
    return NextResponse.json({ error: 'cliente_id obrigatório' }, { status: 400 })
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('equipamentos')
    .select('id, tipo, marca, btus, ambiente')
    .eq('cliente_id', cliente_id)
    .order('tipo', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data ?? [])
}
